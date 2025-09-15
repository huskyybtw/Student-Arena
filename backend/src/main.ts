import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter());
  app.enableCors({
    origin: true, // or specify your frontend URL: ['http://localhost:3001']
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Student Arena API')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.getHttpAdapter().get('/api-json', (req: Request, res: Response) => {
    res.json(document);
  });

  app.useGlobalFilters(new PrismaExceptionFilter());
  await app.listen(3000);
}
bootstrap();
