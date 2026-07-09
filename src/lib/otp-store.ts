interface OtpEntry {
  otp: string;
  expiresAt: number;
}

const store = new Map<string, OtpEntry>();

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOtp(email: string, otp: string): void {
  const key = email.toLowerCase().trim();
  store.set(key, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
}

export function consumeOtp(email: string, otp: string): boolean {
  const key = email.toLowerCase().trim();
  const entry = store.get(key);
  if (!entry) return false;
  store.delete(key);
  if (Date.now() > entry.expiresAt) return false;
  return entry.otp === otp;
}
