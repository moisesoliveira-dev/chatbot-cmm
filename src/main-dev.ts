import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DevAppModule } from './dev-app.module';

async function bootstrap() {
  const app = await NestFactory.create(DevAppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 CMM Chatbot Development Server running on: http://localhost:${port}`);
  console.log(`📡 Webhook endpoint: http://localhost:${port}/webhook/gosac`);
  console.log(`🛠️  Using mock services (no database/redis required)`);
}
bootstrap();
