import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { SESSION_COOKIE } from './auth/session.service.js';

function enableCrossOriginSessionCookies(app: INestApplication) {
  app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000', credentials: true });
}

function setupSwaggerOutsideProduction(app: INestApplication) {
  if (process.env.NODE_ENV === 'production') return;

  const config = new DocumentBuilder()
    .setTitle('Anniymah API')
    .setDescription('Admin + storefront API for the Anniymah backend')
    .setVersion('1.0')
    .addCookieAuth(SESSION_COOKIE)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(cookieParser());
  enableCrossOriginSessionCookies(app);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  setupSwaggerOutsideProduction(app);

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
