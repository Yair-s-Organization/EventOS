import { Controller, Post, Body, Get, Param, ParseIntPipe, Patch, UseGuards, Req } from '@nestjs/common';
import { ReservationsService } from '../services/reservations.service';
import { CreateReservationDto } from '../dto/createReservation.dto';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Get('mis-boletos')
  async obtenerMisBoletos(@Req() req: any) {
    const idUsuario = this.obtenerIdUsuarioAutenticado(req);
    return await this.reservationsService.obtenerMisBoletos(idUsuario);
  }

  // Detalle de un boleto específico con QR al vuelo
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
  @Get('disponibilidad/:idSubEvento')
  async consultarDisponibilidad(
    @Param('idSubEvento', ParseIntPipe) idSubEvento: number,
  ) {
    return await this.reservationsService.consultarDisponibilidad(idSubEvento);
  }

  // Crear una reserva con transacción atómica y QR
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Post()
  async crearReserva(@Req() req: any, @Body() dto: CreateReservationDto) {
    const idUsuario = this.obtenerIdUsuarioAutenticado(req);
    return await this.reservationsService.crearReserva(idUsuario, dto);
  }

  // Cancelación lógica y liberación de lugar
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