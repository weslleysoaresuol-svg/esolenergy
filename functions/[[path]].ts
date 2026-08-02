export const onRequest: PagesFunction = async (context) => {
  try {
    // @ts-ignore
    const serverModule = await import("../dist/server/server.js");
    const server = serverModule.default ?? serverModule;
    return await server.fetch(context.request, context.env, context);
  } catch (err: any) {
    console.error("SSR Handler Error:", err);
    return new Response("Internal SSR Error: " + (err?.message || String(err)), { status: 500 });
  }
};
