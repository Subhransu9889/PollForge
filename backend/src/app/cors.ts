const defaultOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];

export function allowedOrigins() {
  const configuredOrigins = process.env.CLIENT_ORIGIN?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return configuredOrigins?.length ? configuredOrigins : defaultOrigins;
}
