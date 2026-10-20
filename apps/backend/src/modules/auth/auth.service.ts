import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsuarioEntity } from './entities/usuario.entity';
import { TipoCuentaUsuario, EstadoVerificacion } from '@eventos/shared';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
  @InjectRepository(UsuarioEntity)
  private readonly usuarioRepository: Repository<UsuarioEntity>,
  private readonly jwtService: JwtService,
) {}

  async registrar(dto: {
    nombre: string;
    apP: string;
    apM?: string;
    correo: string;
    contrasena: string;
  }) {
    // 1. Verificar que el correo electrónico no esté registrado previamente en la base de datos
    const existe = await this.usuarioRepository.findOne({ where: { correo: dto.correo } });
    if (existe) {
      throw new ConflictException('El correo electrónico ya se encuentra registrado.');
    }

    // 2. Encriptar la contraseña de forma segura usando bcrypt antes de guardarla
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.contrasena, saltRounds);

    // 3. Asignación automática de rol según el dominio del correo (Regla de Negocio)
    const correoMin = dto.correo.toLowerCase();
    let tipoAsignado = TipoCuentaUsuario.ASISTENTE; // Rol base estándar

    if (correoMin.endsWith('@alumno.ipn.mx') || correoMin.endsWith('@ipn.mx')) {
      tipoAsignado = TipoCuentaUsuario.ASISTENTE; // Rol para Usuario Interno (Comunidad Politécnica)
    } else {
      tipoAsignado = TipoCuentaUsuario.ASISTENTE; // Rol para Usuario Externo (Correos comerciales)
    }

    // 4. Crear el nuevo registro con los campos requeridos
    const nuevoUsuario = this.usuarioRepository.create({
      nombre: dto.nombre,
      apP: dto.apP,
      apM: dto.apM || null,
      correo: dto.correo,
      contrasena: hashedPassword,
      estatus: true,
      esVerificado: EstadoVerificacion.NO_VERIFICADO,
      tipoCuenta: tipoAsignado,
      esJefeAcademia: false,
    });

    const guardado = await this.usuarioRepository.save(nuevoUsuario);
    const { contrasena, ...resultado } = guardado;

    return {
      mensaje: 'Usuario registrado con éxito',
      usuario: resultado,
    };
  }

  async login(dto: { correo: string; contrasena: string; captchaToken?: string }) {
    const usuario = await this.usuarioRepository.findOne({
      where: { correo: dto.correo },
    });

    if (!usuario || !usuario.contrasena) {
      throw new UnauthorizedException('Credenciales incorrectas o inexistentes.');
    }

    if (!usuario.estatus) {
      throw new UnauthorizedException('La cuenta se encuentra inactiva.');
    }

    //Verificar bloqueo preventivo
    if (usuario.tipoCuenta === TipoCuentaUsuario.ADMINISTRADOR && usuario.bloqueadoHasta) {
      const ahora = new Date();
      if (ahora < new Date(usuario.bloqueadoHasta)) {
        throw new UnauthorizedException(
          'Cuenta bloqueada temporalmente por seguridad tras múltiples intentos fallidos. Intente más tarde. (MSG-14)',
        );
      } else {
        //Si ya pasó el tiempo de bloqueo, reiniciamos
        usuario.bloqueadoHasta = null;
        usuario.intentosFallidos = 0;
        await this.usuarioRepository.save(usuario);
      }
    }

    //Validamos contraseña
    const esPasswordValido = await bcrypt.compare(dto.contrasena, usuario.contrasena);
    
    if (!esPasswordValido) {
      //Si es Administrador, incrementamos el contador de intentos fallidos
      if (usuario.tipoCuenta === TipoCuentaUsuario.ADMINISTRADOR) {
        usuario.intentosFallidos = (usuario.intentosFallidos || 0) + 1;

        //Si llega a 5 intentos fallidos, bloqueamos por 30 minutos
        if (usuario.intentosFallidos >= 5) {
          const bloqueoTime = new Date();
          bloqueoTime.setMinutes(bloqueoTime.getMinutes() + 30); // 30 minutos de bloqueo
          
          usuario.bloqueadoHasta = bloqueoTime;
          await this.usuarioRepository.save(usuario);

          throw new UnauthorizedException(
            'Demasiados intentos fallidos. La cuenta de Administrador ha sido bloqueada temporalmente por 30 minutos. (MSG-14)',
          );
        }

        await this.usuarioRepository.save(usuario);
      }

      throw new UnauthorizedException('Credenciales incorrectas o inexistentes.');
    }

    //Login exitoso, contadores a 0
    if (usuario.tipoCuenta === TipoCuentaUsuario.ADMINISTRADOR) {
      usuario.intentosFallidos = 0;
      usuario.bloqueadoHasta = null;
      await this.usuarioRepository.save(usuario);
    }

    const payload = {
      sub: usuario.idUsuario,
      correo: usuario.correo,
      tipoCuenta: usuario.tipoCuenta,
      esJefeAcademia: usuario.esJefeAcademia,
    };

    const accessToken = this.jwtService.sign(payload);

    const { contrasena, ...datosUsuario } = usuario;
    return {
      mensaje: 'Inicio de sesión exitoso',
      access_token: accessToken,
      usuario: datosUsuario,
    };
  }

  async logout() {
    return {
      mensaje: 'Sesión finalizada con éxito',
    };
  }
}

