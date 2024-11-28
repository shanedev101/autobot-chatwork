import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import rateLimit from 'express-rate-limit';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const port = process.env.PORT || 3333;
  const app = await NestFactory.create(AppModule);

  // Cross-origin resource sharing (CORS) is a mechanism that allows resources
  // to be requested from another domain
  app.enableCors({
    origin: '*',
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
  });

  app.use(
    rateLimit({
      // How long we should remember the requests? - 15 minutes
      windowMs: 15 * 60 * 1000,
      // Limit each IP to 100 requests per windowMs
      max: 100,
    }),
  );

  await app.listen(port);
  Logger.log(`Hell-o! ${await app.getUrl()}`);
}
bootstrap();
