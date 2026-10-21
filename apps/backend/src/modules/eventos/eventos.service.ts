import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventoEntity } from './entities/evento.entity';

@Injectable()
export class EventosService {
  constructor(
    @InjectRepository(EventoEntity)
    private readonly eventoRepository: Repository<EventoEntity>,
  ) {}

  async crearEvento(usuarioId: number, dtoCrearEvento: any) {
    const nuevoEvento = this.eventoRepository.create({
      ...dtoCrearEvento,
      idCreador: usuarioId,
    });

    const eventoGuardado = await this.eventoRepository.save(nuevoEvento);

    return {
      mensaje: 'Evento registrado con éxito y rol de Organizador asignado.',
      evento: eventoGuardado,
    };
  }
}