export const CONTACT_COUNTRY_CODES = [
  { code: "+91", label: "India (+91)" },
  { code: "+1", label: "US/Canada (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+971", label: "UAE (+971)" },
  { code: "+61", label: "Australia (+61)" },
  { code: "+65", label: "Singapore (+65)" },
  { code: "+49", label: "Germany (+49)" },
  { code: "+33", label: "France (+33)" },
] as const;

export function normalizeInternationalPhone(countryCode: string, phone: string) {
  const trimmed = phone.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) return trimmed;
  const digits = trimmed.replace(/\D/g, "").replace(/^0+/, "");
  return `${countryCode}${digits}`;
}
