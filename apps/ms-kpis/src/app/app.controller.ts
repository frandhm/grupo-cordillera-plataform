import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('KPIs')
@Controller('kpis')
export class AppController {
  constructor(private readonly kpiService: AppService) { }

  @Get()
  @ApiOperation({ summary: 'Listar todos los KPIs registrados' })
  async obtenerKpis() {
    return await this.kpiService.obtenerTodos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un KPI por su ID' })
  async obtenerPorId(@Param('id') id: string) {
    return await this.kpiService.obtenerPorId(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo KPI (usa Patrón Factory)' })
  async crearNuevoKpi(@Body() datos: any) {
    return await this.kpiService.crearKpi(datos);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Registrar nueva medición (acumula valor y guarda historial)' })
  async actualizarKpi(@Param('id') id: string, @Body('valor') valor: number) {
    return await this.kpiService.actualizarValor(id, valor);
  }

  @Get(':id/historial')
  @ApiOperation({ summary: 'Consultar histórico de mediciones de un indicador' })
  async obtenerHistorial(@Param('id') id: string) {
    return await this.kpiService.obtenerHistorial(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar KPI y su historial (Cascade)' })
  async eliminarKpi(@Param('id') id: string) {
    return await this.kpiService.eliminarKpi(id);
  }
}