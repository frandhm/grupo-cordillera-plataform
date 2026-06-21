import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateMetaDto } from './dto/create-meta.dto';
import { UpdateMetaDto } from './dto/update-meta.dto';

@ApiTags('Metas Estratégicas')
@Controller('metas')
export class AppController {
  constructor(private readonly metaService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las metas y su porcentaje de cumplimiento en tiempo real' })
  async obtenerMetas() {
    return await this.metaService.obtenerTodas();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una meta específica' })
  async obtenerMetaPorId(@Param('id') id: string) {
    return await this.metaService.obtenerPorId(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva meta (Sincroniza con MS-KPIs usando Adapter)' })
  async crearMeta(@Body() datos: CreateMetaDto) {
    return await this.metaService.crearMeta(datos);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una meta existente' })
  async actualizarMeta(@Param('id') id: string, @Body() datos: UpdateMetaDto) {
    return await this.metaService.actualizarMeta(id, datos);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una meta del sistema' })
  async eliminarMeta(@Param('id') id: string) {
    return await this.metaService.eliminarMeta(id);
  }
}
