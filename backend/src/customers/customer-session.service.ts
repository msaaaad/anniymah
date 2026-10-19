import { createHmac, timingSafeEqual as nodeTimingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';

export const CUSTOMER_SESSION_COOKIE = 'anniymah_customer_session';
// Longer-lived than the admin session (7 days) — a shopper logging in on
// their own phone expects to stay logged in for a while.
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

@Injectable()
export class CustomerSessionService {
  private sign(payload: string): string {
    return createHmac('sha256', process.env.SESSION_SECRET ?? '').update(payload).digest('hex');
  }

  private timingSafeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return nodeTimingSafeEqual(bufA, bufB);
  }

  createSessionToken(customerId: string): string {
    const expiresAt = Date.now() + SESSION_TTL_MS;
    const payload = `${customerId}|${expiresAt}`;
    return `${payload}|${this.sign(payload)}`;
  }

  // Returns the customerId if the token is valid, otherwise null — unlike
  // the admin version there's no fixed identity to compare against, so
  // verification only proves the token wasn't forged/expired, not that the
  // customer still exists (callers that need that should look it up).
  verifySessionToken(token: string | undefined): string | null {
    if (!token) return null;
    const parts = token.split('|');
    if (parts.length !== 3) return null;
    const [customerId, expiresAtRaw, signature] = parts;
    const expiresAt = Number(expiresAtRaw);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;

    const expectedSignature = this.sign(`${customerId}|${expiresAtRaw}`);
    if (!this.timingSafeEqual(signature, expectedSignature)) return null;

    return customerId;
  }
}
