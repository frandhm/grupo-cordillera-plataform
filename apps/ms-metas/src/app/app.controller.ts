import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('metas')
export class AppController {
  constructor(private readonly metaService: AppService) {}

  @Get()
  async obtenerMetas() {
    return await this.metaService.obtenerTodas();
  }

  @Get(':id')
  async obtenerMetaPorId(@Param('id') id: string) {
    return await this.metaService.obtenerPorId(id);
  }

  @Post()
  async crearMeta(@Body() datos: any) {
    return await this.metaService.crearMeta(datos);
  }

  @Put(':id')
  async actualizarMeta(@Param('id') id: string, @Body() datos: any) {
    return await this.metaService.actualizarMeta(id, datos);
  }

  @Delete(':id')
  async eliminarMeta(@Param('id') id: string) {
    return await this.metaService.eliminarMeta(id);
  }
}