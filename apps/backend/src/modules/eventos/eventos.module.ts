import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventoEntity } from './entities/evento.entity';
import { UsuarioEntity } from '../auth/entities/usuario.entity';
import { EventosService } from './services/eventos.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([EventoEntity, UsuarioEntity]),
    ],
    providers: [EventosService],
    exports: [EventosService],
})
export class EventosModule { }
