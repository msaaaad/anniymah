import { createHmac, timingSafeEqual as nodeTimingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';

export const SESSION_COOKIE = 'anniymah_admin_session';
const SEVEN_DAYS_MS = 1000 * 60 * 60 * 24 * 7;
const TOKEN_FIELD_SEPARATOR = '|';

@Injectable()
export class SessionService {
  private sign(payload: string): string {
    return createHmac('sha256', process.env.SESSION_SECRET ?? '').update(payload).digest('hex');
  }

  timingSafeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return nodeTimingSafeEqual(bufA, bufB);
  }

  createSessionToken(email: string): string {
    const expiresAt = Date.now() + SEVEN_DAYS_MS;
    const payload = `${email}${TOKEN_FIELD_SEPARATOR}${expiresAt}`;
    return `${payload}${TOKEN_FIELD_SEPARATOR}${this.sign(payload)}`;
  }

  verifySessionToken(token: string | undefined): boolean {
    if (!token) return false;
    const parts = token.split(TOKEN_FIELD_SEPARATOR);
    if (parts.length !== 3) return false;
    const [email, expiresAtRaw, signature] = parts;
    const expiresAt = Number(expiresAtRaw);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

    const expectedSignature = this.sign(`${email}${TOKEN_FIELD_SEPARATOR}${expiresAtRaw}`);
    if (!this.timingSafeEqual(signature, expectedSignature)) return false;

    return email === (process.env.ADMIN_EMAIL ?? '').toLowerCase();
  }
}
