const DEFAULT_STAFF = [
  "florante.catapang@ych.com",
  "florantecatapang6@gmail.com",
];

export function isStaffEmail(email?: string | null) {
  if (!email) return false;
  const value = email.trim().toLowerCase();
  const extra = (process.env.AUTH_STAFF_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return extra.includes(value) || DEFAULT_STAFF.includes(value) || value.endsWith("@ych.com");
}

export function isGoogleAuthConfigured() {
  return Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
}
