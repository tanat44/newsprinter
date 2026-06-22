import { DatabaseSync } from "node:sqlite";

export const db = new DatabaseSync("db.sqlite3");

export function initDatabase() {
  db.exec(`
  CREATE TABLE IF NOT EXISTS news(
    key INTEGER PRIMARY KEY,
    createDate INTEGER,
    url TEXT,
    path TEXT
  ) STRICT
`);
  console.log("create database");
}

export function dbHasNews(url: string): boolean {
  const statement = db.prepare("SELECT * FROM news WHERE url = ?");
  const result = statement.all(url);
  return result.length > 0;
}

export function dbInsertNews(
  createDate: number,
  url: string,
  path: string,
): boolean {
  const statement = db.prepare(
    "INSERT OR REPLACE INTO news (createDate, url) SELECT ?, ? WHERE NOT EXISTS (SELECT * FROM news WHERE url = ?)",
  );
  const result = statement.run(createDate, url, url);
  return result?.changes === 1;
}
