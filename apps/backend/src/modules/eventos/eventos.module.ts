import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventoEntity } from './entities/evento.entity';
import { UsuarioEntity } from '../auth/entities/usuario.entity';
import { SubEventoEntity } from './entities/subevento.entity';
import { EventosService } from './services/eventos.service';
import { RecintosModule } from '../recintos/recintos.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([EventoEntity, UsuarioEntity, SubEventoEntity]),
        RecintosModule,
    ],
    providers: [EventosService],
    exports: [EventosService],
})
export class EventosModule { }
