import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('kpis')
export class AppController {
  constructor(private readonly kpiService: AppService) { }

  @Get()
  async obtenerKpis() {
    return await this.kpiService.obtenerTodos();
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return await this.kpiService.obtenerPorId(id);
  }

  @Post()
  async crearNuevoKpi(@Body() datos: any) {
    return await this.kpiService.crearKpi(datos);
  }

  @Patch(':id')
  async actualizarKpi(@Param('id') id: string, @Body('valor') valor: number) {
    return await this.kpiService.actualizarValor(id, valor);
  }

  @Get(':id/historial')
  async obtenerHistorial(@Param('id') id: string) {
    return await this.kpiService.obtenerHistorial(id);
  }

  @Delete(':id')
  async eliminarKpi(@Param('id') id: string) {
    return await this.kpiService.eliminarKpi(id);
  }
}