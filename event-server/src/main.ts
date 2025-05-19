import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as CookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(CookieParser());
  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
