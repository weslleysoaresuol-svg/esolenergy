// @ts-ignore
import server from "../dist/server/server.js";

export const onRequest: PagesFunction = async (context) => {
  return server.fetch(context.request, context.env, context);
};
