function normalizeOrigin(origin?: string) {
  return origin?.trim().replace(/\/+$/, "");
}

function isDefinedOrigin(origin: string | undefined): origin is string {
  return Boolean(origin);
}

const defaultOrigins = [
  normalizeOrigin(process.env.FRONTEND_URL),
  "http://localhost:5173",
].filter(isDefinedOrigin);

export function allowedOrigins() {
  const configuredOrigins = process.env.CLIENT_ORIGIN?.split(",")
    .map(normalizeOrigin)
    .filter(isDefinedOrigin) || [];

  return [...new Set([...defaultOrigins, ...configuredOrigins])];
}
