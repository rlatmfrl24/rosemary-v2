export interface WebPushTarget {
	endpoint: string;
	p256dh: string;
	auth: string;
}

export interface WebPushOptions {
	vapidPublicKey: string;
	vapidPrivateKey: string;
	subject: string;
	ttlSeconds?: number;
}

export interface WebPushSendResult {
	ok: boolean;
	status: number;
	error?: string;
}

const DEFAULT_TTL_SECONDS = 60;

function toBase64(bytes: Uint8Array): string {
	if (typeof Buffer !== 'undefined') {
		return Buffer.from(bytes).toString('base64');
	}
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary);
}

function fromBase64(base64: string): Uint8Array {
	if (typeof Buffer !== 'undefined') {
		return new Uint8Array(Buffer.from(base64, 'base64'));
	}
	const binary = atob(base64);
	return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function toBase64Url(bytes: Uint8Array): string {
	return toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function normalizeBase64Url(input: string): string {
	return input.trim().replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(input: string): Uint8Array {
	const normalized = normalizeBase64Url(input);
	const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=').replace(/-/g, '+').replace(/_/g, '/');
	return fromBase64(padded);
}

function encodeJsonBase64Url(input: unknown): string {
	return toBase64Url(new TextEncoder().encode(JSON.stringify(input)));
}

function readLength(bytes: Uint8Array, offset: number): { length: number; bytesRead: number } {
	const first = bytes[offset];
	if ((first & 0x80) === 0) {
		return { length: first, bytesRead: 1 };
	}

	const count = first & 0x7f;
	let length = 0;
	for (let index = 0; index < count; index += 1) {
		length = (length << 8) | bytes[offset + 1 + index];
	}
	return { length, bytesRead: 1 + count };
}

function derToJose(derSignature: ArrayBuffer): Uint8Array {
	const der = new Uint8Array(derSignature);
	let offset = 0;

	if (der[offset] !== 0x30) {
		throw new Error('Invalid DER signature sequence.');
	}
	offset += 1;

	const sequenceLengthInfo = readLength(der, offset);
	offset += sequenceLengthInfo.bytesRead;

	if (der[offset] !== 0x02) {
		throw new Error('Invalid DER signature R marker.');
	}
	offset += 1;

	const rLengthInfo = readLength(der, offset);
	offset += rLengthInfo.bytesRead;
	const r = der.slice(offset, offset + rLengthInfo.length);
	offset += rLengthInfo.length;

	if (der[offset] !== 0x02) {
		throw new Error('Invalid DER signature S marker.');
	}
	offset += 1;

	const sLengthInfo = readLength(der, offset);
	offset += sLengthInfo.bytesRead;
	const s = der.slice(offset, offset + sLengthInfo.length);

	const jose = new Uint8Array(64);
	jose.set(r.slice(Math.max(0, r.length - 32)), Math.max(0, 32 - r.length));
	jose.set(s.slice(Math.max(0, s.length - 32)), 32 + Math.max(0, 32 - s.length));
	return jose;
}

function parsePublicKeyCoordinates(vapidPublicKey: string): { x: string; y: string } {
	const publicBytes = fromBase64Url(vapidPublicKey);
	if (publicBytes.length !== 65 || publicBytes[0] !== 0x04) {
		throw new Error('VAPID public key must be an uncompressed P-256 key.');
	}

	return {
		x: toBase64Url(publicBytes.slice(1, 33)),
		y: toBase64Url(publicBytes.slice(33, 65))
	};
}

async function importVapidPrivateKey(
	vapidPrivateKey: string,
	vapidPublicKey: string
): Promise<CryptoKey> {
	const { x, y } = parsePublicKeyCoordinates(vapidPublicKey);
	const d = toBase64Url(fromBase64Url(vapidPrivateKey));

	return crypto.subtle.importKey(
		'jwk',
		{
			kty: 'EC',
			crv: 'P-256',
			x,
			y,
			d,
			ext: false
		},
		{ name: 'ECDSA', namedCurve: 'P-256' },
		false,
		['sign']
	);
}

async function createVapidJwt(endpoint: string, options: WebPushOptions): Promise<string> {
	const privateKey = await importVapidPrivateKey(options.vapidPrivateKey, options.vapidPublicKey);
	const aud = new URL(endpoint).origin;
	const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60;

	const header = encodeJsonBase64Url({ alg: 'ES256', typ: 'JWT' });
	const payload = encodeJsonBase64Url({
		aud,
		exp,
		sub: options.subject
	});
	const signingInput = `${header}.${payload}`;
	const signatureDer = await crypto.subtle.sign(
		{ name: 'ECDSA', hash: { name: 'SHA-256' } },
		privateKey,
		new TextEncoder().encode(signingInput)
	);
	const signature = toBase64Url(derToJose(signatureDer));

	return `${signingInput}.${signature}`;
}

export async function sendWebPushNotification(
	target: WebPushTarget,
	options: WebPushOptions
): Promise<WebPushSendResult> {
	try {
		const normalizedPublicKey = normalizeBase64Url(options.vapidPublicKey);
		const jwt = await createVapidJwt(target.endpoint, {
			...options,
			vapidPublicKey: normalizedPublicKey
		});

		const response = await fetch(target.endpoint, {
			method: 'POST',
			headers: {
				TTL: String(options.ttlSeconds ?? DEFAULT_TTL_SECONDS),
				Urgency: 'normal',
				Authorization: `vapid t=${jwt}, k=${normalizedPublicKey}`,
				'Crypto-Key': `p256ecdsa=${normalizedPublicKey}`
			}
		});

		if (response.ok) {
			return { ok: true, status: response.status };
		}

		const responseText = await response.text();
		return {
			ok: false,
			status: response.status,
			error: responseText || `Web push request failed: ${response.status}`
		};
	} catch (error) {
		return {
			ok: false,
			status: 0,
			error: error instanceof Error ? error.message : 'Unknown web push error'
		};
	}
}

export function isExpiredSubscriptionStatus(status: number): boolean {
	return status === 404 || status === 410;
}
