import { Controller, Post, Body, Get, Param, ParseIntPipe, Patch, UseGuards, Req } from '@nestjs/common';
import { ReservationsService } from '../services/reservations.service';
import { CreateReservationDto } from '../dto/createReservation.dto';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../auth/roles.guard';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  
  private obtenerIdUsuarioAutenticado(req: any): number {
    const idUsuario = req.user?.sub ?? req.user?.idUsuario;
    if (!idUsuario) {
      throw new ForbiddenException('No se pudo identificar al usuario en el token.');
    }
    return Number(idUsuario);
  }

  // Lista de eventos del usuario
  @ApiOperation({ summary: 'Consultar mis boletos y reservas activas' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Get('mis-boletos')
  async obtenerMisBoletos(@Req() req: any) {
    const idUsuario = this.obtenerIdUsuarioAutenticado(req);
    return await this.reservationsService.obtenerMisBoletos(idUsuario);
  }

  // Detalle de un boleto específico con QR al vuelo
  @ApiOperation({ summary: 'Obtener detalle de un boleto con código QR' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Get('mis-boletos/:idBoleto')
  async obtenerDetalleBoleto(
    @Req() req: any,
    @Param('idBoleto', ParseIntPipe) idBoleto: number,
  ) {
    const idUsuario = this.obtenerIdUsuarioAutenticado(req);
    return await this.reservationsService.obtenerDetalleBoleto(idUsuario, idBoleto);
  }

  // Consultar lugares y asientos libres (Público para UI05 / UI05.1)
  @ApiOperation({ summary: 'Consultar disponibilidad de lugares y asientos de un subevento' })
  @Get('disponibilidad/:idSubEvento')
  async consultarDisponibilidad(
    @Param('idSubEvento', ParseIntPipe) idSubEvento: number,
  ) {
    return await this.reservationsService.consultarDisponibilidad(idSubEvento);
  }

  // Crear una reserva con transacción atómica y QR
  @ApiOperation({ summary: 'Crear reserva de lugar y generar boleto QR' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Post()
  async crearReserva(@Req() req: any, @Body() dto: CreateReservationDto) {
    const idUsuario = this.obtenerIdUsuarioAutenticado(req);
    return await this.reservationsService.crearReserva(idUsuario, dto);
  }

  // Cancelación lógica y liberación de lugar
  @ApiOperation({ summary: 'Cancelar reserva y liberar lugar' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Patch(':idBoleto/cancelar')
  async cancelarReserva(
    @Req() req: any,
    @Param('idBoleto', ParseIntPipe) idBoleto: number,
  ) {
    const idUsuario = this.obtenerIdUsuarioAutenticado(req);
    return await this.reservationsService.cancelarReserva(idUsuario, idBoleto);
  }
}