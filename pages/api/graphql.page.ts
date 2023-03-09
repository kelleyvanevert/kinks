import type { NextApiRequest, NextApiResponse } from "next";
import { createYoga } from "graphql-yoga";
import { schema } from "./schema";

export default createYoga<{
  req: NextApiRequest;
  res: NextApiResponse;
}>({
  schema,
  graphqlEndpoint: "/api/graphql",
  context({ req }) {
    const isAdmin =
      req.headers["authorization"] === "60a0aca55d2df93a2eec0e5313db5a8b";
    // ..which is md5(<SUPER-SECRET!!>) :P

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
