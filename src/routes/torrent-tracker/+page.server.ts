import { type Actions } from '@sveltejs/kit';
import { TorrentTrackerDatabase } from '$lib/server/torrent-tracker/database';
import type { TorrentTrackerHistory } from '$lib/torrent-tracker/types';
import { COUNTRIES } from '$lib/torrent-tracker/types';

export const actions: Actions = {
	checkAlreadyUpdated: async (event) => {
		const db = new TorrentTrackerDatabase(event.platform?.env.DB as D1Database);
		const formData = await event.request.formData();
		const date = formData.get('date') as string;
		const country = formData.get('country') as string;

		const isUpdated = await db.checkAlreadyUpdated(date, country);
		return { isUpdated };
	},

	checkAllCountriesStatus: async (event) => {
		const db = new TorrentTrackerDatabase(event.platform?.env.DB as D1Database);
		const formData = await event.request.formData();
		const date = formData.get('date') as string;

		const statusMap = await db.checkAllCountriesStatus(date, COUNTRIES);
		return { statusMap };
	},

	update: async (event) => {
		const db = new TorrentTrackerDatabase(event.platform?.env.DB as D1Database);
		const formData = await event.request.formData();
		const dataString = formData.get('data') as string;
		const body = JSON.parse(dataString) as TorrentTrackerHistory[];

		const result = await db.insertTorrentHistory(body);
		return { success: true, message: 'Update successful', result };
	},

	clearDB: async (event) => {
		const db = new TorrentTrackerDatabase(event.platform?.env.DB as D1Database);
		const result = await db.clearAll();
		return { success: true, message: 'Clear DB successful', result };
	},

	reset: async (event) => {
		const db = new TorrentTrackerDatabase(event.platform?.env.DB as D1Database);
		const formData = await event.request.formData();
		const date = formData.get('date') as string;
		const country = formData.get('country') as string;

		const result = await db.deleteByDateAndCountry(date, country);
		return { success: true, message: 'Reset successful', result };
	}
};
