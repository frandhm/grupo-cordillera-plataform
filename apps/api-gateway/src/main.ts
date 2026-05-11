import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Activamos las validaciones globales (para el LoginDto por ejemplo)
  app.useGlobalPipes(new ValidationPipe());

  // Configuración de Swagger para la Gateway
  const config = new DocumentBuilder()
    .setTitle('Grupo Cordillera - API Gateway')
    .setDescription('Punto de entrada único para la gestión de KPIs, Metas y Usuarios')
    .setVersion('1.0')
    .addBearerAuth() // <--- ¡OJO AQUÍ! Esto añade el botón "Authorize" para el JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();