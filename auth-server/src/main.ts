import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as CookieParser from 'cookie-parser';

declare const module: any;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(CookieParser());
  app.enableCors({
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3001);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
