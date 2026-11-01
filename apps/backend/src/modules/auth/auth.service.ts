import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsuarioEntity } from './entities/usuario.entity';
import { TipoCuentaUsuario, EstadoVerificacion } from '@eventos/shared';
import { JwtService } from '@nestjs/jwt';
import { TOKEN_BLACKLIST } from './roles.guard';

@Injectable()
export class AuthService {
  private readonly SOLO_LETRAS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async registrar(dto: {
    nombre: string;
    apellidoPa: string;
    apellidoMa?: string;
    correo: string;
    contrasena: string;
  }) {
    const nombre = dto.nombre?.trim() ?? '';
    const apellidoPa = dto.apellidoPa?.trim() ?? '';
    const apellidoMa = dto.apellidoMa?.trim() ?? '';
    const correo = dto.correo?.trim().toLowerCase() ?? '';
    const contrasenaRaw = dto.contrasena ?? '';

    //Rechazar campos nulos, vacíos o solo con espacios
    if (
      !nombre ||
      !apellidoPa ||
      !apellidoMa ||
      !correo ||
      !contrasenaRaw.trim()
    ) {
      throw new BadRequestException(
        'Por favor, completa todos los campos obligatorios resaltados para continuar (MSG-17).',
      );
    }

    //Validar longitud máxima de 50 caracteres en Nombre y Apellidos
    if (
      nombre.length > 50 ||
      apellidoPa.length > 50 ||
      apellidoMa.length > 50
    ) {
      throw new BadRequestException(
        'El nombre y los apellidos no pueden exceder los 50 caracteres.',
      );
    }

    //Validar que Nombre y Apellidos contengan únicamente letras
    if (
      !this.SOLO_LETRAS_REGEX.test(nombre) ||
      !this.SOLO_LETRAS_REGEX.test(apellidoPa) ||
      !this.SOLO_LETRAS_REGEX.test(apellidoMa)
    ) {
      throw new BadRequestException(
        'El nombre y los apellidos solo pueden contener letras, sin números ni símbolos especiales.',
      );
    }

    const existe = await this.usuarioRepository.findOne({
      where: { correo },
    });
    if (existe) {
      throw new ConflictException(
        'El correo electrónico ya se encuentra registrado.',
      );
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contrasenaRaw, saltRounds);

    let tipoAsignado = TipoCuentaUsuario.EXTERNO;
    if (correo.endsWith('@alumno.ipn.mx') || correo.endsWith('@ipn.mx')) {
      tipoAsignado = TipoCuentaUsuario.INTERNO;
    } else {
      tipoAsignado = TipoCuentaUsuario.EXTERNO;
    }

    const nuevoUsuario = this.usuarioRepository.create({
      nombre: dto.nombre.trim(),
      apellidoPa: dto.apellidoPa.trim(),
      apellidoMa: dto.apellidoMa ? dto.apellidoMa.trim() : null,
      correo: dto.correo.trim().toLowerCase(),
      contrasena: hashedPassword,
      estatus: true,
      esVerificado: EstadoVerificacion.NO_VERIFICADO,
      tipoCuenta: tipoAsignado,
      esJefeAcademia: false,
  });

    const guardado = await this.usuarioRepository.save(nuevoUsuario);
    const { contrasena: _contrasena, ...resultado } = guardado;

    return {
      mensaje: 'Usuario registrado con éxito',
      usuario: resultado,
    };
  }

  async login(dto: {
    correo: string;
    contrasena: string;
    captchaToken?: string;
  }) {
    if (process.env.RECAPTCHA_SECRET_KEY) {
      if (!dto.captchaToken) {
        throw new UnauthorizedException(
          'Por favor, completa la verificación del CAPTCHA.',
        );
      }

      const secretKey = process.env.RECAPTCHA_SECRET_KEY;
      const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${dto.captchaToken}`;

      try {
        const response = await fetch(verifyUrl, { method: 'POST' });
        const captchaResult = await response.json();

        if (!captchaResult.success) {
          throw new UnauthorizedException(
            'Validación de CAPTCHA fallida o inválida.',
          );
        }
      } catch (error) {
        throw new UnauthorizedException(
          'No se pudo verificar el CAPTCHA con los servidores externos.',
        );
      }
    }

    const usuario = await this.usuarioRepository.findOne({
      where: { correo: dto.correo },
    });

    if (!usuario || !usuario.contrasena) {
      throw new UnauthorizedException(
        'Credenciales incorrectas o inexistentes.',
      );
    }

    if (!usuario.estatus) {
      throw new UnauthorizedException('La cuenta se encuentra inactiva.');
    }

    if (
      usuario.tipoCuenta === TipoCuentaUsuario.ADMINISTRADOR &&
      usuario.bloqueadoHasta
    ) {
      const ahora = new Date();
      if (ahora < new Date(usuario.bloqueadoHasta)) {
        throw new UnauthorizedException(
          'Cuenta bloqueada temporalmente por seguridad tras múltiples intentos fallidos. Intente más tarde. (MSG-14)',
        );
      } else {
        usuario.bloqueadoHasta = null;
        usuario.intentosFallidos = 0;
        await this.usuarioRepository.save(usuario);
      }
    }

    const esPasswordValido = await bcrypt.compare(
      dto.contrasena,
      usuario.contrasena,
    );

    if (!esPasswordValido) {
      if (usuario.tipoCuenta === TipoCuentaUsuario.ADMINISTRADOR) {
        usuario.intentosFallidos = (usuario.intentosFallidos || 0) + 1;

        if (usuario.intentosFallidos >= 5) {
          const bloqueoTime = new Date();
          bloqueoTime.setMinutes(bloqueoTime.getMinutes() + 30);

          usuario.bloqueadoHasta = bloqueoTime;
          await this.usuarioRepository.save(usuario);

          throw new UnauthorizedException(
            'Demasiados intentos fallidos. La cuenta de Administrador ha sido bloqueada temporalmente por 30 minutos. (MSG-14)',
          );
        }

        await this.usuarioRepository.save(usuario);
      }

      throw new UnauthorizedException(
        'Credenciales incorrectas o inexistentes.',
      );
    }

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

    const { contrasena: _contrasena, ...datosUsuario } = usuario;
    return {
      mensaje: 'Inicio de sesión exitoso',
      access_token: accessToken,
      usuario: datosUsuario,
    };
  }

  async logout(token?: string) {
    if (token) {
      TOKEN_BLACKLIST.add(token);
    }
    return {
      mensaje: 'Sesión finalizada con éxito.',
    };
  }
}