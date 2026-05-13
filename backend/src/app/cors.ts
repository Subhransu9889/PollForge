const defaultOrigins = [process.env.FRONTEND_URL!, "http://localhost:5173/"];

export function allowedOrigins() {
  const configuredOrigins = process.env.CLIENT_ORIGIN?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return configuredOrigins?.length ? configuredOrigins : defaultOrigins;
}
