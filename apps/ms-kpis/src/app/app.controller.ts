import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('kpis')
export class AppController {
  // El "constructor" inyecta el servicio para que el controlador lo use
  constructor(private readonly kpiService: AppService) { }

  @Get()
  async obtenerKpis() {
    return await this.kpiService.obtenerTodos();
  }

  @Post()
  async crearNuevoKpi(@Body() datos: any) {
    return await this.kpiService.crearKpi(datos);
  }
}