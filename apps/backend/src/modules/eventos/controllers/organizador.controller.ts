import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../auth/roles.guard';
import { OrganizadorService } from '../services/organizador.service';
import { ModificarLogisticaDto } from '../dto/modificarLogistica.dto';
import { ActualizarInfoGeneralDto } from '../dto/actualizarInfoGeneral.dto';
import { AgregarInvitadoDto } from '../dto/invitadoPrivado.dto';
import { CancelarSolicitudDto } from '../dto/cancelarSolicitud.dto';
import { AgregarPersonalLogisticaDto } from '../dto/agregarPersonalLogistica.dto';
import { posterOptions } from '../../../common/upload/upload.options';

@ApiTags('Organizador')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('eventos')
export class OrganizadorController {
  constructor(private readonly organizadorService: OrganizadorService) {}

  private obtenerIdUsuarioAutenticado(req: any): number {
    const idUsuario = req.user?.sub ?? req.user?.idUsuario;
    if (!idUsuario) {
      throw new ForbiddenException(
        'No se pudo identificar al usuario en el token.',
      );
    }
    return Number(idUsuario);
  }

  private obtenerRolUsuarioAutenticado(req: any): string | undefined {
    return req.user?.tipoCuenta;
  }

  @ApiOperation({
    summary: 'Consultar mis eventos registrados como organizador',
  })
  @Get('mis-eventos')
  async obtenerMisEventos(@Req() req: any) {
    const idUsuario = this.obtenerIdUsuarioAutenticado(req);
    return await this.organizadorService.obtenerMisEventos(idUsuario);
  }

  @ApiOperation({
    summary: 'Consultar detalle administrativo de un evento propio',
  })
  @Get(':idEvento/detalle-organizador')
  async obtenerDetalleOrganizador(
    @Param('idEvento', ParseIntPipe) idEvento: number,
    @Req() req: any,
  ) {
    const idUsuario = this.obtenerIdUsuarioAutenticado(req);
    const rolActor = this.obtenerRolUsuarioAutenticado(req);
    return await this.organizadorService.obtenerDetalleOrganizador(
      idEvento,
      idUsuario,
      rolActor,
    );
  }

  @ApiOperation({
    summary:
      'Solicitar o actualizar in-flight la modificación logística de un evento',
  })
  @Patch(':idEvento/logistica')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async solicitarModificacionLogistica(
    @Param('idEvento', ParseIntPipe) idEvento: number,
    @Body() dto: ModificarLogisticaDto,
    @Req() req: any,
  ) {
    const idUsuario = this.obtenerIdUsuarioAutenticado(req);
    const rolActor = this.obtenerRolUsuarioAutenticado(req);
    return await this.organizadorService.solicitarModificacionLogistica(
      idEvento,
      idUsuario,
      dto,
      rolActor,
    );
  }

  @ApiOperation({
    summary:
      'Actualizar información general, alcance, póster y ponentes de un evento con aprobación automática',
  })
  @Patch(':idEvento/info-general')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'poster', maxCount: 1 },
      ],
      posterOptions,
    ),
  )
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async actualizarInfoGeneral(
    @Param('idEvento', ParseIntPipe) idEvento: number,
    @Body() dto: ActualizarInfoGeneralDto,
    @UploadedFiles()
    files:
      | { file?: Express.Multer.File[]; poster?: Express.Multer.File[] }
      | undefined,
    @Req() req: any,
  ) {
    const idUsuario = this.obtenerIdUsuarioAutenticado(req);
    const rolActor = this.obtenerRolUsuarioAutenticado(req);
    const posterFile = files?.file?.[0] ?? files?.poster?.[0];
    return await this.organizadorService.actualizarInfoGeneral(
      idEvento,
      idUsuario,
      dto,
      posterFile,
      rolActor,
    );
  }

  @ApiOperation({
    summary:
      'Agregar un invitado con cuenta activa al padrón de un evento privado',
  })
  @Post(':idEvento/invitados')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async agregarInvitadoPrivado(
    @Param('idEvento', ParseIntPipe) idEvento: number,
    @Body() dto: AgregarInvitadoDto,
    @Req() req: any,
  ) {
    const idUsuario = this.obtenerIdUsuarioAutenticado(req);
    return await this.organizadorService.agregarInvitadoPrivado(
      idEvento,
      idUsuario,
      dto,
    );
  }

  @ApiOperation({
    summary:
      'Reenviar invitación de evento privado respetando cooldown de 8 horas',
  })
  @Post(':idEvento/invitados/:idInvitacion/reenviar')
  async reenviarInvitacionPrivada(
    @Param('idEvento', ParseIntPipe) idEvento: number,
    @Param('idInvitacion', ParseIntPipe) idInvitacion: number,
    @Req() req: any,
  ) {
    const idUsuario = this.obtenerIdUsuarioAutenticado(req);
    return await this.organizadorService.reenviarInvitacionPrivada(
      idEvento,
      idInvitacion,
      idUsuario,
    );
  }

  @ApiOperation({
    summary: 'Revocar la invitación de un invitado en un evento privado',
  })
  @Delete(':idEvento/invitados/:idInvitacion')
  async revocarInvitacionPrivada(
    @Param('idEvento', ParseIntPipe) idEvento: number,
    @Param('idInvitacion', ParseIntPipe) idInvitacion: number,
    @Req() req: any,
  ) {
    const idUsuario = this.obtenerIdUsuarioAutenticado(req);
    return await this.organizadorService.revocarInvitacionPrivada(
      idEvento,
      idInvitacion,
      idUsuario,
    );
  }

  @ApiOperation({
    summary:
      'Cancelar un evento propio con justificación obligatoria y anulación de boletos',
  })
  @Patch(':idEvento/cancelar')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async cancelarEventoPropio(
    @Param('idEvento', ParseIntPipe) idEvento: number,
    @Body() dto: CancelarSolicitudDto,
    @Req() req: any,
  ) {
    const idUsuario = this.obtenerIdUsuarioAutenticado(req);
    return await this.organizadorService.cancelarEventoPropio(
      idEvento,
      idUsuario,
      dto.motivo,
    );
  }

  @ApiOperation({
    summary:
      'Asignar directamente o invitar por correo (token 48h) a un colaborador como Personal de Logística',
  })
  @Post(':idEvento/personal-logistica')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async agregarPersonalLogistica(
    @Param('idEvento', ParseIntPipe) idEvento: number,
    @Body() dto: AgregarPersonalLogisticaDto,
    @Req() req: any,
  ) {
    const idUsuario = this.obtenerIdUsuarioAutenticado(req);
    const rolActor = this.obtenerRolUsuarioAutenticado(req);
    return await this.organizadorService.agregarPersonalLogistica(
      idEvento,
      idUsuario,
      dto,
      rolActor,
    );
  }

  @ApiOperation({
    summary:
      'Revocar los permisos de Personal de Logística a un usuario asignado a este evento',
  })
  @Delete(':idEvento/personal-logistica/:idUsuario')
  async revocarPersonalLogistica(
    @Param('idEvento', ParseIntPipe) idEvento: number,
    @Param('idUsuario', ParseIntPipe) idUsuarioLogistica: number,
    @Req() req: any,
  ) {
    const idUsuario = this.obtenerIdUsuarioAutenticado(req);
    return await this.organizadorService.revocarPersonalLogistica(
      idEvento,
      idUsuario,
      idUsuarioLogistica,
    );
  }
}

