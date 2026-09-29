/** Never grant access based on an unverified email or on a client-supplied ID. */
export function verifiedGoogleIdentity(profile: unknown): { email: string; subject: string } | null {
  if (!profile || typeof profile !== "object") return null;
  const data = profile as Record<string, unknown>;
  if (data.email_verified !== true || typeof data.email !== "string" || typeof data.sub !== "string") return null;
  const email = data.email.trim().toLowerCase();
  const subject = data.sub.trim();
  if (!email || !subject) return null;
  return { email, subject };
}
