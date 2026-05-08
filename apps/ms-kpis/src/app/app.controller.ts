import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('kpis')
export class AppController {
  // El "constructor" inyecta el servicio para que el controlador lo use
  constructor(private readonly kpiService: AppService) { }

  @Get()
  obtenerKpis() {
    return this.kpiService.obtenerTodos();
  }

  @Post()
  crearNuevoKpi(@Body() datos: any) {
    return this.kpiService.crearKpi(datos);
  }
}