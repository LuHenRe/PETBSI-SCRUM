/** Nomes das variáveis operacionais; valores são configurados fora do repositório. */
export const ENV_KEYS = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
  "AUTH_URL",
] as const;

export type EnvKey = (typeof ENV_KEYS)[number];

export function getServerEnv(key: EnvKey): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env[key];
}
