import { writeFileSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { buildSwaggerConfig } from './swagger.config.js';

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });
  const document = SwaggerModule.createDocument(app, buildSwaggerConfig());
  writeFileSync('openapi.json', JSON.stringify(document, null, 2));
  await app.close();
}
await generate();
