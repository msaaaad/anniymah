const BANGLADESHI_MOBILE_NUMBER_PATTERN = /^(?:\+?880|0)1[3-9]\d{8}$/;

export function normalizePhone(input: string): string {
  return input.replace(/[\s-]/g, '');
}

export function isValidBangladeshiPhone(input: string): boolean {
  return BANGLADESHI_MOBILE_NUMBER_PATTERN.test(normalizePhone(input));
}
