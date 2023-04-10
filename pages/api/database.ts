import "dotenv/config";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("No DATABASE_URL env var provided");
}

class Database {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  });
}

export let db: Database;

if (process.env.NODE_ENV === "production") {
  db = new Database();
} else {
  if (!(global as any).db) {
    (global as any).db = new Database();
  }
  db = (global as any).db;
}
