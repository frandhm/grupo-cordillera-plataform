import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Estructura Organizacional (Equipos y Áreas)')
@Controller('equipos')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo equipo de trabajo' })
  crear(@Body() datos: any) {
    return this.appService.crear(datos);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los equipos con su área asociada' })
  obtenerTodos() {
    return this.appService.obtenerTodos();
  }

  @Get('areas')
  @ApiOperation({ summary: 'Listar las áreas de la empresa' })
  obtenerAreas() {
    return this.appService.obtenerAreas();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un equipo por su ID' })
  obtenerPorId(@Param('id') id: string) {
    return this.appService.obtenerPorId(id);
  }

  @Post('areas')
  @ApiOperation({ summary: 'Crear una nueva área departamental' })
  crearArea(@Body('nombre') nombre: string) {
    return this.appService.crearArea(nombre);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un equipo del sistema' })
  eliminar(@Param('id') id: string) {
    return this.appService.eliminar(id);
  }
}
