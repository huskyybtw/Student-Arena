import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter());

  const config = new DocumentBuilder()
    .setTitle('Student Arena API')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.getHttpAdapter().get('/api-json', (req: Request, res: Response) => {
    res.json(document);
  });

  await app.listen(3000);
}
bootstrap();
