import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateKpiDto } from './dto/create-kpi.dto';

@Controller('kpis')
export class AppController {
  // El "constructor" inyecta el servicio para que el controlador lo use
  constructor(private readonly kpiService: AppService) { }

  @Get()
  async obtenerKpis() {
    return await this.kpiService.obtenerTodos();
  }

  @Post()
  async crearNuevoKpi(@Body() datos: CreateKpiDto) {
    // Cambiamos 'any' por nuestro DTO
    return await this.kpiService.crearKpi(datos);
  }
}