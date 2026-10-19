import { createHmac, timingSafeEqual as nodeTimingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';

export const SESSION_COOKIE = 'anniymah_admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

// Same token shape as the Next.js frontend's lib/session.ts: "email|expiresAt|hmac".
// "|" (not ".") separates fields — email addresses always contain dots.
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
    const expiresAt = Date.now() + SESSION_TTL_MS;
    const payload = `${email}|${expiresAt}`;
    return `${payload}|${this.sign(payload)}`;
  }

  verifySessionToken(token: string | undefined): boolean {
    if (!token) return false;
    const parts = token.split('|');
    if (parts.length !== 3) return false;
    const [email, expiresAtRaw, signature] = parts;
    const expiresAt = Number(expiresAtRaw);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

    const expectedSignature = this.sign(`${email}|${expiresAtRaw}`);
    if (!this.timingSafeEqual(signature, expectedSignature)) return false;

    return email === (process.env.ADMIN_EMAIL ?? '').toLowerCase();
  }
}
