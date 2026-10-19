import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { SESSION_COOKIE } from './auth/session.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(cookieParser());
  // credentials: true is required for the session cookie to work cross-origin
  // (the frontend and this API run on different ports/domains).
  app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000', credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger only outside production — no reason to expose the full API
  // shape publicly once this is a real deployed service.
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Anniymah API')
      .setDescription('Admin + storefront API for the Anniymah backend')
      .setVersion('1.0')
      .addCookieAuth(SESSION_COOKIE)
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
