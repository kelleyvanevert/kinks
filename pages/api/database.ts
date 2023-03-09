import "dotenv/config";
import { Pool } from "pg";

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
