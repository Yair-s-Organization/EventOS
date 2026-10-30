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
import { RecintoService } from '../services/recinto.service';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TipoCuentaUsuario } from '@eventos/shared';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CambiarEstadoRecintoDto } from '../dto/cambiar-estado-recinto.dto';
import { CambiarEstadoEquipoDto } from '../dto/cambiar-estado-equipo.dto';

@ApiTags('Espacios y Equipos')
@Controller(['espacios', 'recintos', 'equipos'])
export class EspaciosController {
    constructor(private readonly recintoService: RecintoService) {}

    //Espacios disponibles para solicitud de eventos
    @ApiOperation({ summary: 'Listar espacios físicos disponibles para eventos' })
    @Get('disponibles')
    async listarDisponibles() {
        return await this.recintoService.listarEspaciosDisponibles();
    }

    //Listar todos los espacios físicos
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar todos los espacios físicos registrados' })
    @Get()
    @UseGuards(RolesGuard)
    @Roles(TipoCuentaUsuario.ADMINISTRADOR)
    async listarTodos() {
        return await this.recintoService.listarTodosLosEspacios();
    }

    //Cambiar estado de un recinto
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cambiar estado operativo de un recinto' })
    @Patch(':id/estado')
    @UseGuards(RolesGuard)
    @Roles(TipoCuentaUsuario.ADMINISTRADOR)
    async cambiarEstadoEspacio(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CambiarEstadoRecintoDto,
    ) {
        return await this.recintoService.cambiarEstadoEspacio(id, dto.idEstadoRecinto);
    }

    //Listar equipos de cómputo de un laboratorio
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar equipos de cómputo de un laboratorio' })
    @Get(':id/equipos')
    @UseGuards(RolesGuard)
    @Roles(TipoCuentaUsuario.ADMINISTRADOR)
    async listarEquipos(@Param('id', ParseIntPipe) id: number) {
        return await this.recintoService.listarEquiposPorLaboratorio(id);
    }

    //Cambiar estado de un equipo de cómputo
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cambiar estado operativo de un equipo de cómputo' })
    @Patch([':idEquipo/estado', 'equipos/:idEquipo/estado', ':id/equipos/:idEquipo/estado'])
    @UseGuards(RolesGuard)
    @Roles(TipoCuentaUsuario.ADMINISTRADOR)
    async cambiarEstadoEquipo(
        @Param('idEquipo', ParseIntPipe) idEquipo: number,
        @Body() dto: CambiarEstadoEquipoDto,
    ) {
        return await this.recintoService.cambiarEstadoEquipo(idEquipo, dto.estado);
    }

    //Consulta la agenda y horarios disponibles de un espacio en una fecha
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Consultar agenda y horarios ocupados de un espacio por fecha' })
    @Get([':id/agenda', ':id/horarios-disponibles'])
    @UseGuards(RolesGuard)
    async obtenerAgenda(
        @Param('id', ParseIntPipe) id: number,
        @Query('fecha') fecha: string,
    ) {
        return await this.recintoService.obtenerAgendaEspacio(id, fecha);
    }
}