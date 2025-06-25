import { torrent_tracker_history } from '$lib/server/db/schema';
import { drizzle } from 'drizzle-orm/d1';
import { and, eq } from 'drizzle-orm';
import type { TorrentTrackerHistory } from '$lib/torrent-tracker/types';

export class TorrentTrackerDatabase {
	private db: ReturnType<typeof drizzle>;

	constructor(database: D1Database) {
		this.db = drizzle(database);
	}

	async checkAlreadyUpdated(date: string, country: string): Promise<boolean> {
		const result = await this.db
			.select()
			.from(torrent_tracker_history)
			.where(
				and(eq(torrent_tracker_history.date, date), eq(torrent_tracker_history.country, country))
			);

		return result.length > 0;
	}

	async checkAllCountriesStatus(
		date: string,
		allCountries: readonly string[]
	): Promise<Record<string, boolean>> {
		const results = await this.db
			.select({ country: torrent_tracker_history.country })
			.from(torrent_tracker_history)
			.where(eq(torrent_tracker_history.date, date));

		const statusMap: Record<string, boolean> = {};
		const updatedCountries = new Set(results.map((row) => row.country));

		allCountries.forEach((country) => {
			statusMap[country] = updatedCountries.has(country);
		});

		return statusMap;
	}

	async insertTorrentHistory(data: TorrentTrackerHistory[]) {
		return await this.db.insert(torrent_tracker_history).values(data);
	}

	async clearAll() {
		return await this.db.delete(torrent_tracker_history);
	}

	async deleteByDateAndCountry(date: string, country: string) {
		return await this.db
			.delete(torrent_tracker_history)
			.where(
				and(eq(torrent_tracker_history.date, date), eq(torrent_tracker_history.country, country))
			);
	}
}
