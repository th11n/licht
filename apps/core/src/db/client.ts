import { Database } from "bun:sqlite";

export type DbClient = Database;

export function createDb(dbPath: string): DbClient {
    return new Database(dbPath);
}