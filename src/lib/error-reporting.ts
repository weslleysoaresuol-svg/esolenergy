export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  console.error("[Esol Energy Error]", {
    error,
    route: window.location.pathname,
    timestamp: new Date().toISOString(),
    ...context,
  });
}
