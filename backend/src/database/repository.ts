import { Pool } from "pg";
export interface SearchEntry {
  id: string;
  city: string;
  country: string;
  searchedAt: string;
}
export interface SearchRepository {
  ping(): Promise<number>;
  recordSearch(city: string, country: string): Promise<void>;
  recentSearches(): Promise<SearchEntry[]>;
}
export function createRepository(pool: Pool): SearchRepository {
  return {
    async ping() {
      const result = await pool.query<{ value: number }>("SELECT 1 AS value");
      return result.rows[0].value;
    },
    async recordSearch(city, country) {
      await pool.query("INSERT INTO searches (city, country) VALUES ($1, $2)", [
        city,
        country,
      ]);
    },
    async recentSearches() {
      const result = await pool.query<{
        id: string;
        city: string;
        country: string;
        searched_at: Date;
      }>(
        "SELECT id, city, country, searched_at FROM searches ORDER BY searched_at DESC, id DESC LIMIT $1",
        [10],
      );
      return result.rows.map((row) => ({
        id: row.id,
        city: row.city,
        country: row.country,
        searchedAt: row.searched_at.toISOString(),
      }));
    },
  };
}
