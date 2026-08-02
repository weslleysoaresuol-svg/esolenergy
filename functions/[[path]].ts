import server from "../src/server";

export const onRequest: PagesFunction = async (context) => {
  return server.fetch(context.request, context.env, context);
};
