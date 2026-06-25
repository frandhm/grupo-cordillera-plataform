import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix(globalPrefix);

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Grupo Cordillera - Microservicio de Metas')
    .setDescription('API para la gestión de objetivos estratégicos y seguimiento de cumplimiento')
    .setVersion('1.0')
    .addTag('metas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3002;
  await app.listen(port);
  Logger.log(`🚀 Metas Microservice running on: http://localhost:${port}/${globalPrefix}`);
}
bootstrap();
