import { Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class LogisticaService {
//   constructor(
//     @InjectRepository(UsuarioEventoRolEntity)
//     private readonly usuarioEventoRolRepository: Repository<UsuarioEventoRolEntity>,
//   ) {}

  async validarAccesoLogistica(usuarioId: number, eventoId: number) {
    const tienePermiso = false; 

    if (!tienePermiso) {
      throw new ForbiddenException(
        'Acceso denegado (HTTP 403). No cuentas con permisos de Personal de Logística para este evento específico.',
      );
    }

    return { autorizado: true };
  }
}