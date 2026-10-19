import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { CUSTOMER_SESSION_COOKIE, CustomerSessionService } from './customer-session.service.js';

export interface RequestWithCustomer extends Request {
  customerId: string;
}

@Injectable()
export class CustomerSessionGuard implements CanActivate {
  constructor(private readonly sessionService: CustomerSessionService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithCustomer>();
    const token = request.cookies?.[CUSTOMER_SESSION_COOKIE] as string | undefined;

    const customerId = this.sessionService.verifySessionToken(token);
    if (!customerId) {
      throw new UnauthorizedException();
    }
    request.customerId = customerId;
    return true;
  }
}
