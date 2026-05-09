import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    HttpModule, // Importante: Esto permite que el Gateway actúe como cliente
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }