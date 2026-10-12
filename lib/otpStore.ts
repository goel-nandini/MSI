/**
 * In-Memory OTP Storage and Rate Limiting
 */

export interface StoredOtpData {
  phone: string;
  otp: string;
  expiresAt: number;
  lastSentAt: number;
  attempts: number;
  meta?: {
    name?: string;
    email?: string;
    stream?: string;
    password?: string;
    purpose?: 'login' | 'signup' | 'verification';
  };
}

// Global store to survive hot-reload in development
const globalRef = global as unknown as {
  __msi_otp_store?: Map<string, StoredOtpData>;
};

if (!globalRef.__msi_otp_store) {
  globalRef.__msi_otp_store = new Map<string, StoredOtpData>();
}

const otpStore: Map<string, StoredOtpData> = globalRef.__msi_otp_store;

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes validity
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds cooldown between resends
const MAX_ATTEMPTS = 5;

/**
 * Checks if a phone number is currently in cooldown before allowing a resend
 */
export function checkOtpCooldown(phone: string): { canSend: boolean; remainingSeconds: number } {
  const existing = otpStore.get(phone);
  if (!existing) {
    return { canSend: true, remainingSeconds: 0 };
  }

  const elapsed = Date.now() - existing.lastSentAt;
  if (elapsed < RESEND_COOLDOWN_MS) {
    const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
    return { canSend: false, remainingSeconds };
  }

  return { canSend: true, remainingSeconds: 0 };
}

/**
 * Saves a newly generated OTP for a phone number
 */
export function saveOtp(
  phone: string,
  otp: string,
  meta?: StoredOtpData['meta']
): StoredOtpData {
  const now = Date.now();
  const record: StoredOtpData = {
    phone,
    otp,
    expiresAt: now + OTP_TTL_MS,
    lastSentAt: now,
    attempts: 0,
    meta,
  };

  otpStore.set(phone, record);
  return record;
}

/**
 * Verifies a submitted OTP for a phone number
 */
export function verifyOtp(
  phone: string,
  submittedOtp: string
): {
  valid: boolean;
  message: string;
  meta?: StoredOtpData['meta'];
} {
  const record = otpStore.get(phone);

  if (!record) {
    return {
      valid: false,
      message: 'No active OTP found for this number. Please request a new OTP.',
    };
  }

  // Check Expiry
  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return {
      valid: false,
      message: 'OTP has expired. Please request a new verification code.',
    };
  }

  // Check Attempt Limits
  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(phone);
    return {
      valid: false,
      message: 'Too many incorrect attempts. Please request a fresh OTP.',
    };
  }

  // Validate OTP Match
  if (record.otp !== submittedOtp.trim()) {
    record.attempts += 1;
    const remainingAttempts = MAX_ATTEMPTS - record.attempts;
    return {
      valid: false,
      message: `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`,
    };
  }

  // Success: Clear OTP so it cannot be reused
  const savedMeta = record.meta;
  otpStore.delete(phone);

  return {
    valid: true,
    message: 'OTP verified successfully.',
    meta: savedMeta,
  };
}

/**
 * Clears expired OTPs periodically to prevent memory leaks
 */
export function cleanupExpiredOtps(): void {
  const now = Date.now();
  for (const [phone, record] of otpStore.entries()) {
    if (now > record.expiresAt) {
      otpStore.delete(phone);
    }
  }
}
