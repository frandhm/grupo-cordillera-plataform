import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('kpis') // La URL será: http://localhost:3000/api/kpis
export class AppController {
  constructor(private readonly kpiService: AppService) { }

  @Get() // Cuando alguien pida ver los KPIs [cite: 100]
  getKpis() {
    return this.kpiService.obtenerTodos();
  }

  @Post() // Cuando un sistema (POS/E-commerce) envíe datos [cite: 25]
  createKpi(@Body() datos: any) {
    return this.kpiService.crearKpi(datos);
  }
}