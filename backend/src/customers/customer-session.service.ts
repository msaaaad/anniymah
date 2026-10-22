import { createHmac, timingSafeEqual as nodeTimingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';

export const CUSTOMER_SESSION_COOKIE = 'anniymah_customer_session';
const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;

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
    const expiresAt = Date.now() + THIRTY_DAYS_MS;
    const payload = `${customerId}|${expiresAt}`;
    return `${payload}|${this.sign(payload)}`;
  }

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
