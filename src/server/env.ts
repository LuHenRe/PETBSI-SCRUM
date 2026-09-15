/**
 * server/env — NOMES de variáveis de ambiente do servidor (sem segredos).
 * ADIADO por orientação do professor: nenhum valor real, token ou credencial
 * vive aqui ou no navegador. Leitura somente no servidor via `process.env`.
 * Nunca importar este módulo em componentes, hooks, domain ou application
 * do lado cliente.
 */
export const ENV_KEYS = [
  "DATABASE_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_DRIVE_FOLDER_ID",
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_CHAT_ID",
] as const;

export type EnvKey = (typeof ENV_KEYS)[number];

export function getServerEnv(key: EnvKey): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env[key];
}
