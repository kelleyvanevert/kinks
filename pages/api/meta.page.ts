import type { NextApiHandler } from "next";
import pkg from "../../package.json";
import { db } from "./database";
import { withTimeout } from "@/lib/withTimeout";

const handler: NextApiHandler = async (req, res) => {
  const databaseConnected = await withTimeout(db.pool.query("select 1"))
    .then(() => true)
    .catch(() => false);

  res.json({
    version: pkg.version,
    databaseConnected,
  });
};

export default handler;
