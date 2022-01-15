import { MicroRequest } from "apollo-server-micro/dist/types";
import { NextApiResponse } from "next";
import apolloServer from "../../graphql";
import appConfig from "config";

const { graphqlUri, host } = appConfig.environmentVariable;

const server = apolloServer.start();
const handler = async (req: MicroRequest, res: NextApiResponse) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  // res.setHeader("Access-Control-Allow-Origin", host);
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  if (req.method === "OPTIONS") {
    res.end();
    return false;
  }
  await server;
  await apolloServer.createHandler({ path: graphqlUri })(req, res);
};

export const config = { api: { bodyParser: false } };

export default handler;
