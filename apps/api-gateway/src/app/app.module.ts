import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    HttpModule,
    JwtModule.register({
      global: true,
      secret: 'CLAVE_SECRETA_CORDILLERA', // La misma clave que en el Guardia
      signOptions: { expiresIn: '1h' },    // El token dura 1 hora
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }