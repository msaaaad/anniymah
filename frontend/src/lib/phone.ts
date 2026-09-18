// Bangladeshi mobile numbers: 11 digits starting with 01, operator digit 3-9,
// optionally prefixed with the country code (+880 or 880).
const BD_PHONE_REGEX = /^(?:\+?880|0)1[3-9]\d{8}$/;

export function normalizePhone(input: string): string {
  return input.replace(/[\s-]/g, "");
}

export function isValidBangladeshiPhone(input: string): boolean {
  return BD_PHONE_REGEX.test(normalizePhone(input));
}
