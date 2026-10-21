import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventoEntity } from './entities/evento.entity';
import { UsuarioEntity } from '../auth/entities/usuario.entity';
import { SubEventoEntity } from './entities/subevento.entity';
import { FechaEntity } from './entities/fecha.entity';
import { EventosService } from './services/eventos.service';
import { RecintosModule } from '../recintos/recintos.module';
import { SolicitudesController } from './controllers/solicitudes.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([EventoEntity, UsuarioEntity, SubEventoEntity, FechaEntity]),
        RecintosModule,
    ],
    controllers: [SolicitudesController],
    providers: [EventosService],
    exports: [EventosService],
})
export class EventosModule { }
