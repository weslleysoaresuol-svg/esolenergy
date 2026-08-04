export function createServerFn(opts: any = {}) {
  const chain: any = {
    middleware: () => chain,
    inputValidator: () => chain,
    handler: (fn: any) => async (args: any) => {
      const data = args?.data || args;
      const context = args?.context || {};
      return fn({ data, context });
    },
  };
  return chain;
}

export function createMiddleware() {
  const chain: any = {
    middleware: () => chain,
    server: (fn: any) => fn,
  };
  return chain;
}

export function useServerFn(fn: any) {
  return fn;
}

export const getRequest = () => null;
export function createStart() {
  return {};
}

export default {};
