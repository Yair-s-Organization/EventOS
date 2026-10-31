import {
  BadRequestException,
  ConflictException,
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
  TipoCuentaUsuario,
  TipoPerfilVerificacion,
  PerfilUsuarioResponse,
  JefeDepartamentoItem,
} from '@eventos/shared';

@Injectable()
export class UsuariosService {
  // Regex unificada de Boleta para Estudiantes y Profesores
  private readonly BOLETA_REGEX = /^(?:\d{4,10}|P[EP]\d{8})$/;

  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
    @InjectRepository(VerificacionEntity)
    private readonly verificacionRepository: Repository<VerificacionEntity>,
    @InjectRepository(RolEntity)
    private readonly rolRepository: Repository<RolEntity>,
    private readonly dataSource: DataSource,
  ) {}

  // Consulta el Perfil
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

  //Estudiantes y Profesores usan Boleta
  async verificarCuenta(
    idUsuario: number,
    tipoPerfil: TipoPerfilVerificacion,
    informacionAdicional: string | null,
    archivoPath: string,
  ) {
    if (!archivoPath) {
      throw new BadRequestException('El documento PDF es obligatorio');
    }

    const infoLimpia = informacionAdicional ? informacionAdicional.trim() : '';

    // Validar Boleta obligatoria para Estudiante, Profesor y Docente
    if (
      tipoPerfil === TipoPerfilVerificacion.ESTUDIANTE ||
      tipoPerfil === TipoPerfilVerificacion.PROFESOR ||
      tipoPerfil === TipoPerfilVerificacion.DOCENTE
    ) {
      if (!infoLimpia || !this.BOLETA_REGEX.test(infoLimpia)) {
        throw new BadRequestException(
          'La boleta es obligatoria para estudiantes y profesores y debe contener únicamente dígitos válidos.',
        );
      }
    }

    if (tipoPerfil === TipoPerfilVerificacion.EMPRESA && !infoLimpia) {
      throw new BadRequestException(
        'El nombre de la empresa es obligatorio para este perfil.',
      );
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
        informacionAdicional: infoLimpia,
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

  // Listar usuarios para Tab 1 (Asignar Jefe -> esJefe = false) y Tab 2 (Revocar Jefe -> esJefe = true)
  async listarCandidatosOJefes(
    esJefe: boolean,
    buscar?: string,
  ): Promise<JefeDepartamentoItem[]> {
    const usuarios = await this.usuarioRepository.find({
      where: {
        estatus: true,
        esJefeAcademia: esJefe,
      },
      order: { idUsuario: 'ASC' },
    });

    // Filtrar cuentas con correo institucional o de tipo interno
    const usuariosInstitucionales = usuarios.filter((u) => {
      const correoMin = u.correo.toLowerCase();
      return (
        u.tipoCuenta === TipoCuentaUsuario.INTERNO ||
        correoMin.endsWith('@ipn.mx') ||
        correoMin.endsWith('@alumno.ipn.mx')
      );
    });

    // Obtener la boleta registrada en la última verificación de cada usuario
    const verificaciones = await this.verificacionRepository.find({
      order: { fecha: 'DESC', idVerificacion: 'DESC' },
    });

    const boletaPorUsuario = new Map<number, string>();
    for (const v of verificaciones) {
      if (!boletaPorUsuario.has(v.idUsuario) && v.informacionAdicional) {
        boletaPorUsuario.set(v.idUsuario, v.informacionAdicional);
      }
    }

    let lista: JefeDepartamentoItem[] = usuariosInstitucionales.map((u) => ({
      idUsuario: u.idUsuario,
      boleta:
        boletaPorUsuario.get(u.idUsuario) ??
        String(u.idUsuario).padStart(4, '0'),
      nombre: `${u.nombre} ${u.apellidoPa} ${u.apellidoMa || ''}`.trim(),
      correoInstitucional: u.correo,
      esJefeAcademia: u.esJefeAcademia,
    }));

    // Buscador superior: filtra por correo institucional o nombre (y también por boleta si la escriben)
    if (buscar && buscar.trim() !== '') {
      const termino = buscar.trim().toLowerCase();
      lista = lista.filter(
        (item) =>
          item.nombre.toLowerCase().includes(termino) ||
          item.correoInstitucional.toLowerCase().includes(termino) ||
          item.boleta.toLowerCase().includes(termino),
      );
    }

    return lista;
  }

  // Tab 1 -> Acción del botón [Asignar Jefe]
  async asignarJefeDepartamento(idUsuario: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { idUsuario, estatus: true },
    });

    if (!usuario) {
      throw new NotFoundException(
        'La cuenta de usuario no existe o se encuentra inactiva.',
      );
    }

    if (usuario.esJefeAcademia) {
      throw new ConflictException(
        'El usuario ya cuenta con los permisos de Jefe de Departamento.',
      );
    }

    usuario.esJefeAcademia = true;
    await this.usuarioRepository.save(usuario);

    const nombreCompleto = `${usuario.nombre} ${usuario.apellidoPa} ${usuario.apellidoMa || ''}`.trim();

    return {
      mensaje: `${nombreCompleto} fue asignado como Jefe de Departamento`,
      idUsuario: usuario.idUsuario,
      nombre: nombreCompleto,
      correoInstitucional: usuario.correo,
      esJefeAcademia: true,
    };
  }

  // Tab 2 -> Acción del botón [Revocar]
  async revocarJefeDepartamento(idUsuario: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { idUsuario, estatus: true },
    });

    if (!usuario) {
      throw new NotFoundException(
        'La cuenta de usuario no existe o se encuentra inactiva.',
      );
    }

    if (!usuario.esJefeAcademia) {
      throw new ConflictException(
        'El usuario no tiene asignado el cargo de Jefe de Departamento.',
      );
    }

    usuario.esJefeAcademia = false;
    await this.usuarioRepository.save(usuario);

    const nombreCompleto = `${usuario.nombre} ${usuario.apellidoPa} ${usuario.apellidoMa || ''}`.trim();

    return {
      mensaje: `${nombreCompleto} fue revocado del cargo`,
      idUsuario: usuario.idUsuario,
      nombre: nombreCompleto,
      correoInstitucional: usuario.correo,
      esJefeAcademia: false,
    };
  }
}