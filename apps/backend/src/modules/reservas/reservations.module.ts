import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { QrService } from './services/qr.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsController } from './controllers/reservations.controller';
import { ReservationsService } from './services/reservations.service';

import { BoletoEntity } from './entities/boleto.entity';
import { EstadoBoletoEntity } from './entities/estadoBoleto.entity';
import { AsistenteEventoEntity } from './entities/asistenteEvento.entity';

import { EventoEntity } from '../eventos/entities/evento.entity';
import { SubEventoEntity } from '../eventos/entities/subevento.entity';
import { FechaEntity } from '../eventos/entities/fecha.entity';
import { EventoPersonalLogisticaEntity } from '../eventos/entities/eventoPersonalLogistica.entity';
import { RecintoEntity } from '../recintos/entities/recinto.entity';
import { AsientoEntity } from './entities/asiento.entity';
import { PonenteEntity } from '../eventos/entities/ponente.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      BoletoEntity,
      EstadoBoletoEntity,
      AsistenteEventoEntity,
      EventoEntity,
      SubEventoEntity,
      FechaEntity,
      EventoPersonalLogisticaEntity,
      RecintoEntity,
      AsientoEntity,
      PonenteEntity,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'clave_secreta_desarrollo',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [ReservationsController],
  providers: [QrService, ReservationsService],
})
export class ReservationsModule {}