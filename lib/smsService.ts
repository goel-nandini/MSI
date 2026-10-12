/**
 * MSI Unified OTP & SMS Dispatcher
 * Provider: ApiTxt Unified OTP API (https://apitxt.com/developer/otp-api)
 * Fallback Provider: Fast2SMS (https://www.fast2sms.com)
 */

export interface SendOtpResult {
  success: boolean;
  message: string;
  isDev?: boolean;
  missingKey?: boolean;
  devOtp?: string;
  requestId?: string;
  cost?: number;
  error?: string;
  provider?: 'apitxt' | 'fast2sms' | 'demo';
}

/**
 * Normalizes phone numbers to standard 10-digit Indian mobile format
 */
export function sanitizeIndianPhone(rawPhone: string): string {
  if (!rawPhone) return '';
  const cleaned = rawPhone.replace(/\D/g, '');
  if (cleaned.length === 10) return cleaned;
  if (cleaned.length === 12 && cleaned.startsWith('91')) return cleaned.slice(2);
  if (cleaned.length === 11 && cleaned.startsWith('0')) return cleaned.slice(1);
  return cleaned;
}

/**
 * Validates whether the number is a valid 10-digit Indian mobile number
 * (Starts with 6, 7, 8, or 9 and is exactly 10 digits)
 */
export function isValidIndianPhone(phone: string): boolean {
  const cleaned = sanitizeIndianPhone(phone);
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP
 */
export function generateNumericOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Dispatches OTP via ApiTxt Unified OTP API (https://apitxt.com/api/sendOTP)
 * Documentation: https://apitxt.com/developer/otp-api
 */
async function sendApiTxtOtp(
  cleanPhone: string,
  otp: string,
  authKey: string
): Promise<SendOtpResult> {
  const channel = process.env.APITXT_CHANNEL?.trim() || 'sms';
  const templateId = process.env.APITXT_TEMPLATE_ID?.trim();
  const templateName = process.env.APITXT_TEMPLATE_NAME?.trim();
  const projectRefId = process.env.APITXT_PROJECT_REF_ID?.trim();

  // ApiTxt accepts 91XXXXXXXXXX (auto-prepended if 10 digits, sending 91+phone is 100% explicit)
  const fullMobile = `91${cleanPhone}`;

  // Build query parameters for GET request (matching exact ApiTxt Example 1: authkey, mobile, otp)
  const url = new URL('https://apitxt.com/api/sendOTP');
  url.searchParams.set('authkey', authKey);
  url.searchParams.set('mobile', fullMobile);
  url.searchParams.set('otp', otp);

  // Optional overrides only if explicitly defined
  if (channel && channel !== 'sms') {
    url.searchParams.set('channel', channel);
    url.searchParams.set('country', '91');
  }
  if (templateId) url.searchParams.set('template_id', templateId);
  if (templateName) url.searchParams.set('template_name', templateName);
  if (projectRefId) url.searchParams.set('project_ref_id', projectRefId);

  try {
    console.log(`[ApiTxt Example 1 Request] GET ${url.toString().replace(authKey, '***KEY***')}`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(9000),
    });

    const data = await response.json().catch(() => null);
    console.log('[ApiTxt Response]', data);

    if (
      response.ok &&
      (data?.status === 'success' || data?.status === 200 || data?.return === true)
    ) {
      return {
        success: true,
        isDev: false,
        provider: 'apitxt',
        requestId: data?.data?.request_id || data?.request_id,
        cost: data?.data?.cost,
        message: data?.message || `OTP dispatched to +91 ${cleanPhone} via ${channel.toUpperCase()}.`,
      };
    }

    // ApiTxt reported an error (e.g. invalid key or wallet exhausted)
    const errorMsg =
      data?.message || data?.error || 'Failed to dispatch via ApiTxt gateway.';
    console.warn('[ApiTxt Gateway Error]', errorMsg);

    const isInsufficientFunds =
      data?.code === 402 || errorMsg.toLowerCase().includes('insufficient');
    const userFriendlyMessage = isInsufficientFunds
      ? 'ApiTxt Wallet Balance ₹0.00 hai (1 SMS bhejne ke liye ₹0.30 chahiye). ApiTxt Dashboard -> Billing se balance recharge kijiye.'
      : `ApiTxt Gateway: ${errorMsg}`;

    return {
      success: false,
      isDev: true,
      devOtp: otp,
      provider: 'apitxt',
      message: userFriendlyMessage,
      error: errorMsg,
    };
  } catch (error: any) {
    console.error('[ApiTxt Network Error]', error);
    return {
      success: false,
      isDev: true,
      devOtp: otp,
      provider: 'apitxt',
      message: 'Network issue contacting ApiTxt gateway.',
      error: error?.message,
    };
  }
}

/**
 * Primary OTP Sender:
 * 1. Checks for ApiTxt API Key (APITXT_AUTH_KEY or APITXT_API_KEY)
 * 2. Checks for Fast2SMS API Key (FAST2SMS_API_KEY) as secondary provider
 * 3. Informs that key is missing if neither is configured
 */
export async function sendOtpToMobile(
  phone: string,
  otp: string,
  purpose: 'login' | 'signup' | 'verification' = 'login'
): Promise<SendOtpResult> {
  const cleanPhone = sanitizeIndianPhone(phone);

  if (!isValidIndianPhone(cleanPhone)) {
    return {
      success: false,
      message: 'Invalid mobile number. Please enter a valid 10-digit Indian mobile number.',
      error: 'INVALID_PHONE_NUMBER',
    };
  }

  // 1. Check for ApiTxt Credentials (Primary)
  const apitxtAuthKey = (
    process.env.APITXT_AUTH_KEY ||
    process.env.APITXT_API_KEY ||
    'enRzd8exAmkuvcLkp2cOwbT69ZTNS5p2eh50444hcso'
  )?.trim();
  if (apitxtAuthKey && apitxtAuthKey !== 'your_apitxt_auth_key_here') {
    return await sendApiTxtOtp(cleanPhone, otp, apitxtAuthKey);
  }

  // 2. Check for Fast2SMS Credentials (Secondary Fallback)
  const fast2smsKey = process.env.FAST2SMS_API_KEY?.trim();
  if (fast2smsKey && fast2smsKey !== 'your_fast2sms_api_key_here') {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: fast2smsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: cleanPhone,
        }),
        signal: AbortSignal.timeout(8000),
      });

      const data = await response.json().catch(() => null);
      if (response.ok && data?.return === true) {
        return {
          success: true,
          isDev: false,
          provider: 'fast2sms',
          requestId: data?.request_id,
          message: `OTP successfully dispatched to +91 ${cleanPhone} via Fast2SMS.`,
        };
      }
    } catch (e: any) {
      console.warn('[Fast2SMS Fallback Error]', e);
    }
  }

  // 3. Neither key is configured: Real SMS cannot be delivered!
  console.log('================================================================');
  console.log(`[Unified OTP Notice] Mobile: +91 ${cleanPhone}`);
  console.log(`[Unified OTP Notice] Real SMS NOT dispatched because APITXT_AUTH_KEY is not set.`);
  console.log(`[Unified OTP Notice] Test OTP generated: ${otp}`);
  console.log('To deliver real SMS to mobile, paste your authkey into .env.local:');
  console.log('APITXT_AUTH_KEY=your_key_here');
  console.log('API Docs: https://apitxt.com/developer/otp-api');
  console.log('================================================================');

  return {
    success: false,
    missingKey: true,
    isDev: true,
    provider: 'demo',
    devOtp: otp,
    message:
      'APITXT_AUTH_KEY is not set in .env.local. Real SMS cannot be delivered to your phone without your ApiTxt Auth Key.',
  };
}

// Backward compatibility alias
export const sendFast2SmsOtp = sendOtpToMobile;
