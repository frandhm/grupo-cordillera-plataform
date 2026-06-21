import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { CreateAreaDto } from './dto/create-area.dto';

@ApiTags('Estructura Organizacional (Equipos y Áreas)')
@Controller('equipos')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo equipo de trabajo' })
  crear(@Body() datos: CreateEquipoDto) {
    return this.appService.crear(datos);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los equipos y sus líderes' })
  obtenerTodos() {
    return this.appService.obtenerTodos();
  }

  @Get('areas')
  @ApiOperation({ summary: 'Listar las áreas de la empresa' })
  obtenerAreas() {
    return this.appService.obtenerAreas();
  }

  @Post('areas')
  @ApiOperation({ summary: 'Crear una nueva área departamental' })
  crearArea(@Body() dto: CreateAreaDto) {
    return this.appService.crearArea(dto.nombre);
  }
}
