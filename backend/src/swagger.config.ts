import { DocumentBuilder } from '@nestjs/swagger';
import { SESSION_COOKIE } from './auth/session.service.js';

export function buildSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('Anniymah API')
    .setDescription('Admin + storefront API for the Anniymah backend')
    .setVersion('1.0')
    .addCookieAuth(SESSION_COOKIE)
    .build();
}
