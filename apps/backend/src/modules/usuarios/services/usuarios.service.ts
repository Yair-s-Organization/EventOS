import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UsuarioEntity } from '../../auth/entities/usuario.entity';
import { VerificacionEntity } from '../../auth/entities/verificacion.entity';
import { RolEntity } from '../entities/rol.entity';
import {
  EstadoVerificacion,
  TipoPerfilVerificacion,
  PerfilUsuarioResponse,
} from '@eventos/shared';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
    @InjectRepository(VerificacionEntity)
    private readonly verificacionRepository: Repository<VerificacionEntity>,
    @InjectRepository(RolEntity)
    private readonly rolRepository: Repository<RolEntity>,
    private readonly dataSource: DataSource,
  ) {}

  // Consulta el Perfil (UI28)
  async obtenerPerfil(idUsuario: number): Promise<PerfilUsuarioResponse> {
    const usuario = await this.usuarioRepository.findOne({
      where: { idUsuario },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Buscamos su última verificación
    const ultimaVerificacion = await this.verificacionRepository.findOne({
      where: { idUsuario },
      order: { fecha: 'DESC' },
    });

    const mapaRoles: Record<number, string> = {
      1: TipoPerfilVerificacion.ESTUDIANTE,
      2: TipoPerfilVerificacion.PROFESOR,
      3: TipoPerfilVerificacion.DOCENTE,
      4: TipoPerfilVerificacion.EMPRESA,
      5: TipoPerfilVerificacion.EXTERNO,
    };

    let tipoUsuario = 'Externo';
    if (ultimaVerificacion && ultimaVerificacion.idRol) {
      tipoUsuario = mapaRoles[ultimaVerificacion.idRol] ?? 'Externo';
    }

    // Caducidad de 3 meses (90 días)
    let verificacionVigente = false;
    let fechaVerificacion: Date | null = null;
    let cuentaEstado = usuario.esVerificado;

    if (ultimaVerificacion && ultimaVerificacion.fecha) {
      fechaVerificacion = new Date(ultimaVerificacion.fecha);
      const hoy = new Date();
      const milisegundosEnTresMeses = 1000 * 60 * 60 * 24 * 90;
      const diferencia = hoy.getTime() - fechaVerificacion.getTime();

      if (diferencia > milisegundosEnTresMeses) {
        cuentaEstado = EstadoVerificacion.NO_VERIFICADO;

        if (usuario.esVerificado === EstadoVerificacion.VERIFICADO) {
          usuario.esVerificado = EstadoVerificacion.NO_VERIFICADO;
          await this.usuarioRepository.save(usuario);
        }
      } else {
        verificacionVigente = true;
      }
    }

    return {
      idUsuario: usuario.idUsuario,
      nombreCompleto: `${usuario.nombre} ${usuario.apellidoPa} ${usuario.apellidoMa || ''}`.trim(),
      correo: usuario.correo,
      tipoCuenta: usuario.tipoCuenta,
      cuenta: cuentaEstado,
      tipoUsuario,
      fechaUltimaVerificacion: fechaVerificacion,
      verificacionVigente,
    };
  }

  // Procesar Verificación (UI32)
  async verificarCuenta(
    idUsuario: number,
    tipoPerfil: TipoPerfilVerificacion,
    informacionAdicional: string | null,
    archivoPath: string,
  ) {
    if (!archivoPath) {
      throw new BadRequestException('El documento PDF es obligatorio');
    }

    let idRolAsignar = 0;
    switch (tipoPerfil) {
      case TipoPerfilVerificacion.ESTUDIANTE:
        idRolAsignar = 1;
        break;
      case TipoPerfilVerificacion.PROFESOR:
        idRolAsignar = 2;
        break;
      case TipoPerfilVerificacion.DOCENTE:
        idRolAsignar = 3;
        break;
      case TipoPerfilVerificacion.EMPRESA:
        idRolAsignar = 4;
        break;
      case TipoPerfilVerificacion.EXTERNO:
        idRolAsignar = 5;
        break;
      default:
        throw new BadRequestException('Tipo de perfil no válido');
    }

    return await this.dataSource.transaction(async (manager) => {
      const usuario = await manager.findOne(UsuarioEntity, {
        where: { idUsuario },
      });

      if (!usuario) throw new NotFoundException('Usuario no encontrado');

      const nuevaVerificacion = manager.create(VerificacionEntity, {
        informacionAdicional: informacionAdicional ?? '',
        archivo: archivoPath,
        idRol: idRolAsignar,
        idUsuario: idUsuario,
      });

      await manager.save(nuevaVerificacion);

      usuario.esVerificado = EstadoVerificacion.VERIFICADO;
      await manager.save(usuario);

      return {
        mensaje: 'Identidad verificada correctamente. Cuenta actualizada.',
        verificacion: nuevaVerificacion,
      };
    });
  }
}