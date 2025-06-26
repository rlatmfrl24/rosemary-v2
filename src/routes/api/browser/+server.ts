import { json, error } from '@sveltejs/kit';
import Cloudflare from 'cloudflare';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ platform }) => {
	if (!platform?.env) {
		return error(500, '환경 변수에 접근할 수 없습니다.');
	}

	const { SECRET_BROWSER_RENDERING_TOKEN, SECRET_CLOUDFLARE_ACCOUNT_ID } = platform.env;

	if (!SECRET_BROWSER_RENDERING_TOKEN || !SECRET_CLOUDFLARE_ACCOUNT_ID) {
		return error(500, 'Cloudflare 환경 변수가 설정되지 않았습니다.');
	}

	const token = await SECRET_BROWSER_RENDERING_TOKEN.get('CLOUDFLARE_BROWSER_RENDERING_TOKEN');
	const accountId = await SECRET_CLOUDFLARE_ACCOUNT_ID.get('CLOUDFLARE_ACCOUNT_ID');

	try {
		const client = new Cloudflare({
			apiToken: token ?? ''
		});

		const content = await client.browserRendering.content.create({
			account_id: accountId ?? '',
			url: 'https://e-hentai.org/'
		});

		console.log(content);

		return json({
			message: 'Browser rendering is available',
			content
		});
	} catch (err) {
		console.error('Browser rendering 오류:', err);
		return error(500, 'Browser rendering 요청 중 오류가 발생했습니다.');
	}
};
