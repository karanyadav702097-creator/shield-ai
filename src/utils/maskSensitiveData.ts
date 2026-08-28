/**
 * Masks sensitive data (OTP, card numbers, CVV, PIN, passwords) before it is
 * ever stored in the database. Always run user input through this first.
 */
export function maskSensitiveData(input: string | null | undefined): string {
  if (!input) return "";
  let out = input;

  // 16-digit card numbers (with optional separators)
  out = out.replace(/\b(?:\d[ -]?){15}\d\b/g, "**** **** **** ****");

  // "OTP is 123456" / "otp: 1234"
  out = out.replace(
    /\b(otp|pin|cvv|password|passcode)\b(\s*(?:is|:|=|-)?\s*)([A-Za-z0-9@#$%^&*!]{3,20})/gi,
    (_m, k, sep) => `${k}${sep}${"*".repeat(6)}`,
  );

  // Bare 6-digit numbers (typical OTP)
  out = out.replace(/\b\d{6}\b/g, "******");

  // Bare 3-digit CVV following the word cvv already handled; mask standalone 4-digit PIN-like near keywords
  out = out.replace(/\b(pin)\b[^0-9]{0,8}\d{4}\b/gi, "$1 ****");

  return out;
}

export function maskUrl(url: string | null | undefined): string {
  if (!url) return "";
  return url.replace(/([?&](token|otp|pwd|password|pin|key)=)[^&\s]+/gi, "$1***");
}
