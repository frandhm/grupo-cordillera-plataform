import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix(globalPrefix);

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Grupo Cordillera - Microservicio de KPIs')
    .setDescription('API para la consolidación de indicadores de desempeño en tiempo real')
    .setVersion('1.0')
    .addTag('kpis')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // URL donde vivirá la documentación

  const port = process.env.PORT || 3001;
  await app.listen(port);

}
bootstrap();