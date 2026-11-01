import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RecintoService } from '../services/recinto.service';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TipoCuentaUsuario } from '@eventos/shared';
import { CambiarEstadoRecintoDto } from '../dto/cambiar-estado-recinto.dto';
import { CambiarEstadoEquipoDto } from '../dto/cambiar-estado-equipo.dto';

@ApiTags('Espacios')
@Controller('espacios')
export class EspaciosController {
    constructor(private readonly recintoService: RecintoService) {}

    // Espacios disponibles para solicitud de eventos
    @Get('disponibles')
    @ApiOperation({ summary: 'Listar espacios físicos disponibles para eventos' })
    async listarDisponibles() {
        return await this.recintoService.listarEspaciosDisponibles();
    }

    // Listar todos los espacios físicos
    @Get()
    @ApiBearerAuth()
    @UseGuards(RolesGuard)
    @Roles(TipoCuentaUsuario.ADMINISTRADOR)
    @ApiOperation({ summary: 'Listar todos los espacios físicos (Administrador)' })
    async listarTodos() {
        return await this.recintoService.listarTodosLosEspacios();
    }

    // Cambiar estado de un recinto
    @Patch(':id/estado')
    @ApiBearerAuth()
    @UseGuards(RolesGuard)
    @Roles(TipoCuentaUsuario.ADMINISTRADOR)
    @ApiOperation({ summary: 'Cambiar estado de un recinto (Administrador)' })
    async cambiarEstadoEspacio(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CambiarEstadoRecintoDto,
    ) {
        return await this.recintoService.cambiarEstadoEspacio(id, dto.idEstadoRecinto);
    }

    // Listar equipos de cómputo de un laboratorio
    @Get(':id/equipos')
    @ApiOperation({ summary: 'Listar equipos de cómputo de un laboratorio' })
    async listarEquipos(@Param('id', ParseIntPipe) id: number) {
        return await this.recintoService.listarEquiposPorLaboratorio(id);
    }

    // Cambiar estado de un equipo de cómputo
    @Patch(':id/equipos/:idEquipo/estado')
    @ApiBearerAuth()
    @UseGuards(RolesGuard)
    @Roles(TipoCuentaUsuario.ADMINISTRADOR)
    @ApiOperation({ summary: 'Cambiar estado de un equipo de cómputo (Administrador)' })
    async cambiarEstadoEquipo(
        @Param('idEquipo', ParseIntPipe) idEquipo: number,
        @Body() dto: CambiarEstadoEquipoDto,
    ) {
        return await this.recintoService.cambiarEstadoEquipo(idEquipo, dto.estado);
    }

    // Consulta la agenda y horarios disponibles de un espacio en una fecha
    @Get(':id/horarios-disponibles')
    @ApiBearerAuth()
    @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Consultar horarios disponibles de un espacio' })
    async obtenerAgenda(
        @Param('id', ParseIntPipe) id: number,
        @Query('fecha') fecha: string,
    ) {
        return await this.recintoService.obtenerAgendaEspacio(id, fecha);
    }
}