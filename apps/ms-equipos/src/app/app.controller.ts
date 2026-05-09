import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('equipos')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post()
  crear(@Body() datos: any) {
    return this.appService.crear(datos);
  }

  @Get()
  obtenerTodos() {
    return this.appService.obtenerTodos();
  }
}