import type { PageServerLoad, Actions } from './$types';
import { local_trend } from '$lib/server/db/schema';
import { drizzle } from 'drizzle-orm/d1';
import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export interface LocalTrendItem {
	id: number;
	name: string;
	downloaded: boolean;
	createdAt: number;
}

export const load: PageServerLoad = async (event) => {
	try {
		const db = drizzle(event.platform?.env.DB as D1Database);

		// 최신 데이터부터 정렬하여 조회
		const items = await db
			.select()
			.from(local_trend)
			.orderBy(desc(local_trend.createdAt));

		return {
			items: items as LocalTrendItem[]
		};
	} catch (error) {
		console.error('Error loading local trend data:', error);
		return {
			items: []
		};
	}
};

export const actions: Actions = {
	saveItems: async (event) => {
		try {
			const db = drizzle(event.platform?.env.DB as D1Database);
			const formData = event.request.formData();

			return formData.then(async (data) => {
				const itemsJson = data.get('items') as string;

				if (!itemsJson) {
					return fail(400, { message: '필수 데이터가 누락되었습니다.' });
				}

				const items: Array<{ name: string }> = JSON.parse(itemsJson);

				// 새 데이터 저장
				const insertPromises = items.map((item) =>
					db.insert(local_trend).values({
						name: item.name,
						downloaded: false
					})
				);

				await Promise.all(insertPromises);

				return { success: true };
			});
		} catch (error) {
			console.error('Error saving local trend data:', error);
			return fail(500, { message: '데이터 저장에 실패했습니다.' });
		}
	},

	toggleDownload: async (event) => {
		try {
			const db = drizzle(event.platform?.env.DB as D1Database);
			const formData = await event.request.formData();

			const id = parseInt(formData.get('id') as string);
			const downloaded = formData.get('downloaded') === 'true';

			if (!id) {
				return fail(400, { message: 'ID가 필요합니다.' });
			}

			await db
				.update(local_trend)
				.set({ downloaded })
				.where(eq(local_trend.id, id));

			return { success: true };
		} catch (error) {
			console.error('Error updating download status:', error);
			return fail(500, { message: '다운로드 상태 변경에 실패했습니다.' });
		}
	},

	deleteItem: async (event) => {
		try {
			const db = drizzle(event.platform?.env.DB as D1Database);
			const formData = await event.request.formData();

			const id = parseInt(formData.get('id') as string);

			if (!id) {
				return fail(400, { message: 'ID가 필요합니다.' });
			}

			await db.delete(local_trend).where(eq(local_trend.id, id));

			return { success: true };
		} catch (error) {
			console.error('Error deleting local trend item:', error);
			return fail(500, { message: '데이터 삭제에 실패했습니다.' });
		}
	}
};

