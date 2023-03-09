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
    const isAdmin = req.headers["kelley"] === "yep";

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
