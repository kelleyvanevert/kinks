import type { NextApiHandler } from "next";
import pkg from "../../package.json";

const handler: NextApiHandler = (req, res) => {
  res.json({
    version: pkg.version,
  });
};

export default handler;
