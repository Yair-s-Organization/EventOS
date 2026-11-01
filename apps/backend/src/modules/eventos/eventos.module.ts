import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventoEntity } from './entities/evento.entity';
import { UsuarioEntity } from '../auth/entities/usuario.entity';
import { SubEventoEntity } from './entities/subevento.entity';
import { FechaEntity } from './entities/fecha.entity';
import { BitacoraEventoEntity } from './entities/bitacoraEvento.entity';
import { EventosService } from './services/eventos.service';
import { SolicitudesService } from './services/solicitudes.service';
import { OrganizadorService } from './services/organizador.service';
import { RecintosModule } from '../recintos/recintos.module';
import { SolicitudesController } from './controllers/solicitudes.controller';
import { OrganizadorController } from './controllers/organizador.controller';
import { PonenteEntity } from './entities/ponente.entity';
import { EventosController } from './controllers/eventos.controller';
import { AsientoEntity } from '../reservas/entities/asiento.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventoEntity,
      UsuarioEntity,
      SubEventoEntity,
      FechaEntity,
      BitacoraEventoEntity,
      PonenteEntity,
      AsientoEntity,
    ]),
    RecintosModule,
  ],
  controllers: [
    SolicitudesController,
    OrganizadorController,
    EventosController,
  ],
  providers: [EventosService, SolicitudesService, OrganizadorService],
  exports: [EventosService, SolicitudesService, OrganizadorService],
})
export class EventosModule {}
