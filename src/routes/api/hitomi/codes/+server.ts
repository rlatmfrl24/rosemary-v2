import { getAllNewItemCodes } from '$lib/server/hitomi-tracker/database';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ platform, url }) => {
	if (!platform?.env?.DB) {
		return json(
			{
				success: false,
				error: '데이터베이스가 연결되지 않았습니다.',
				codes: []
			},
			{
				status: 500,
				headers: { 'Cache-Control': 'no-store' }
			}
		);
	}

	const scope = url.searchParams.get('scope');
	if (scope && scope !== 'all') {
		return json(
			{
				success: false,
				error: '지원하지 않는 scope 입니다.',
				codes: []
			},
			{
				status: 400,
				headers: { 'Cache-Control': 'no-store' }
			}
		);
	}

	const codes = await getAllNewItemCodes(platform.env.DB);
	return json(
		{
			success: true,
			codes
		},
		{
			headers: { 'Cache-Control': 'no-store' }
		}
	);
};
