import type { NextApiRequest, NextApiResponse } from "next";
import { createYoga } from "graphql-yoga";
import md5 from "md5";
import { schema } from "./schema";

if (!process.env.SECRET) {
  throw new Error("No SECRET env var provided");
}

export default createYoga<{
  req: NextApiRequest;
  res: NextApiResponse;
}>({
  schema,
  graphqlEndpoint: "/api/graphql",
  context({ req }) {
    const isAdmin =
      !!req.headers["authorization"] &&
      md5(req.headers["authorization"] + process.env.SECRET) ===
        "1ea3b28d6c4454005075f36aa54c28d9";

    return {
      isAdmin,
    };
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};
