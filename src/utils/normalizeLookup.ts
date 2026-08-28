export type LookupType = "phone" | "upi" | "domain";

export const LOOKUP_TYPES: { value: LookupType; label: string; placeholder: string }[] = [
  { value: "phone", label: "Phone Number", placeholder: "e.g. 9876543210" },
  { value: "upi", label: "UPI ID", placeholder: "e.g. name@okhdfcbank" },
  { value: "domain", label: "Website / Domain", placeholder: "e.g. sbi-kyc-update.xyz" },
];

/**
 * Normalizes a phone number, UPI ID, or domain into a canonical form so that
 * the same value always matches regardless of formatting, spacing, protocol,
 * or "www." prefixes. Used before both storing a report's lookup_value and
 * running a reputation search, so the two stay consistent.
 */
export function normalizeLookupValue(raw: string, type: LookupType): string {
  const value = (raw || "").trim();
  if (!value) return "";

  if (type === "phone") {
    // Keep digits only, drop a leading country code of "91" if present
    // and the result is longer than a typical 10-digit local number.
    const digits = value.replace(/\D/g, "");
    if (digits.length > 10 && digits.startsWith("91")) {
      return digits.slice(-10);
    }
    return digits;
  }

  if (type === "upi") {
    return value.toLowerCase().replace(/\s+/g, "");
  }

  // domain
  let host = value.toLowerCase().replace(/^https?:\/\//, "");
  host = host.split("/")[0];
  host = host.replace(/^www\./, "");
  return host;
}
