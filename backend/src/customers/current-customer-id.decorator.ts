import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { RequestWithCustomer } from './customer-session.guard.js';

export const CurrentCustomerId = createParamDecorator((_: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<RequestWithCustomer>();
  return request.customerId;
});
