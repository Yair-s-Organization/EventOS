import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventoEntity } from '../entities/evento.entity';
import { UsuarioEntity } from '../../auth/entities/usuario.entity';
import { EstadoVerificacion } from '@eventos/shared';

@Injectable()
export class EventosService {
  eventoRepository: Repository<EventoEntity>;
  usuarioRepository: Repository<UsuarioEntity>;

  constructor(@InjectRepository(EventoEntity) repo: Repository<EventoEntity>, @InjectRepository(UsuarioEntity) repoUsuario: Repository<UsuarioEntity>) {
    this.eventoRepository = repo;
    this.usuarioRepository = repoUsuario;
  }

  async verificarUsuario(idUsuario: number) {
    const usuario = await this.usuarioRepository.findOneBy({ idUsuario: idUsuario });
    if (!usuario || usuario.esVerificado !== EstadoVerificacion.VERIFICADO || !usuario.estatus) {
      return false;
    }
    return true;
  }

  async crearEvento(evento: EventoEntity) {
    const estaVerificado = await this.verificarUsuario(evento.idOrganizador);

    if (!estaVerificado) {
      throw new ForbiddenException('El usuario no cuenta con una verificación previa');
    }

    const eventoGuardado = await this.eventoRepository.save(evento);

    return {
      mensaje: 'Evento registrado con éxito y rol de Organizador asignado.',
      evento: eventoGuardado,
    };
  }
}