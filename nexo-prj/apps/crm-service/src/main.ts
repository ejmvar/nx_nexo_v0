import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Set global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3003;
  const host = process.env.HOST || '0.0.0.0';
  
  await app.listen(port, host);
  
  console.log(`🚀 CRM Service is running on: http://${host}:${port}/api`);
  console.log(`📝 API Documentation: http://localhost:${port}/api`);
}
bootstrap();