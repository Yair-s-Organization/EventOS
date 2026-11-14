import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsuarioEntity } from './entities/usuario.entity';
import {
  TipoCuentaUsuario,
  EstadoVerificacion,
  EstadoEvento,
} from '@eventos/shared';
import { JwtService } from '@nestjs/jwt';
import { TOKEN_BLACKLIST } from './roles.guard';
import { ActivarCuentaLogisticaDto } from './dto/activarCuentaLogistica.dto';
import { SolicitarRecuperacionDto } from './dto/solicitarRecuperacion.dto';
import { RestablecerContrasenaDto } from './dto/restablecerContrasena.dto';
import { MailService } from '../reservas/services/mail.service';
import {
  EMAIL_REGEX,
  verificarDominioCorreoValido,
  consumirInvitacionesPendientes,
  TipoInvitacionCorreo,
} from '../../common/utils/correo.util';

@Injectable()
export class AuthService {
  private readonly SOLO_LETRAS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  private readonly PASSWORD_COMPLEJIDAD_REGEX =
    /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
  ) {}

  private async decodificarTokenInvitacion(tokenRaw?: string): Promise<{
    token: string;
    correo: string;
    idEvento: number;
    nombreEvento: string;
    descripcionEvento: string;
    tipo: TipoInvitacionCorreo;
  }> {
    const token = tokenRaw?.trim() ?? '';
    if (!token || TOKEN_BLACKLIST.has(token)) {
      throw new BadRequestException(
        'El enlace de invitación es inválido, ya fue utilizado o ha expirado.',
      );
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(token, {
        secret: process.env.JWT_PASS || 'clave_secreta',
      });
    } catch {
      throw new BadRequestException(
        'El enlace de invitación es inválido, ya fue utilizado o ha expirado.',
      );
    }

    if (
      !payload ||
      (payload.tipo !== 'INVITACION_LOGISTICA' &&
        payload.tipo !== 'INVITACION_EVENTO_PRIVADO') ||
      !payload.correo ||
      !payload.idEvento
    ) {
      throw new BadRequestException(
        'El enlace proporcionado no corresponde a una invitación válida.',
      );
    }

    const correo = String(payload.correo).trim().toLowerCase();
    const idEvento = Number(payload.idEvento);
    const evento = await this.dataSource.query(
      `SELECT "idEvento", nombre, descripcion, "idEstadoEvento" FROM evento WHERE "idEvento" = $1 LIMIT 1`,
      [idEvento],
    );

    if (!evento.length || evento[0].idEstadoEvento === EstadoEvento.CANCELADO) {
      throw new ConflictException('Evento no encontrado o cancelado.');
    }

    return {
      token,
      correo,
      idEvento,
      nombreEvento: String(evento[0].nombre),
      descripcionEvento: String(evento[0].descripcion ?? ''),
      tipo: payload.tipo as TipoInvitacionCorreo,
    };
  }

  async validarTokenInvitacion(tokenRaw?: string) {
    const invitacion = await this.decodificarTokenInvitacion(tokenRaw);

    const existe = await this.usuarioRepository.findOne({
      where: { correo: invitacion.correo },
    });
    if (existe) {
      throw new ConflictException(
        'El correo electrónico de esta invitación ya se encuentra registrado. Inicia sesión para continuar.',
      );
    }

    return {
      valido: true,
      correo: invitacion.correo,
      idEvento: invitacion.idEvento,
      nombreEvento: invitacion.nombreEvento,
      tipo: invitacion.tipo,
    };
  }

  private async validarCapacidadInvitacion(
    idEvento: number,
    tipo: TipoInvitacionCorreo,
    estricto: boolean,
  ): Promise<boolean> {
    if (tipo === 'INVITACION_LOGISTICA') {
      const conteo = await this.dataSource.query(
        `SELECT COUNT(*)::int AS total FROM "eventoPersonalLogistica" WHERE "idEvento" = $1`,
        [idEvento],
      );
      if ((conteo[0]?.total ?? 0) >= 10) {
        if (estricto) {
          throw new BadRequestException(
            'No es posible registrar más personal de logística. El evento ha alcanzado el límite máximo de 10 integrantes.',
          );
        }
        return false;
      }
      return true;
    }

    const recintoRaw = await this.dataSource.query(
      `SELECT COALESCE(r.aforo, 0)::int AS aforo
       FROM "subEvento" s
       INNER JOIN recinto r ON r."idRecinto" = s."idRecinto"
       WHERE s."idEvento" = $1
       ORDER BY s."idSubEvento" ASC
       LIMIT 1`,
      [idEvento],
    );
    const cupoMaximo = recintoRaw[0]?.aforo ?? 0;
    if (cupoMaximo > 0) {
      const conteoInvitados = await this.dataSource.query(
        `SELECT COUNT(*)::int AS total FROM "invitacionEvento" WHERE "idEvento" = $1`,
        [idEvento],
      );
      if ((conteoInvitados[0]?.total ?? 0) >= cupoMaximo) {
        if (estricto) {
          throw new ConflictException(
            'La cantidad solicitada excede el límite disponible.',
          );
        }
        return false;
      }
    }
    return true;
  }

  private async vincularUsuarioAInvitacion(
    usuario: UsuarioEntity,
    idEvento: number,
    tipo: TipoInvitacionCorreo,
    estricto: boolean,
  ): Promise<void> {
    const eventoRaw = await this.dataSource.query(
      `SELECT e."idEvento", e.nombre, e.descripcion, e."idEstadoEvento",
              u.correo AS "correoOrg", u.nombre AS "nombreOrg", u."apellidoPa" AS "apellidoPaOrg"
       FROM evento e
       INNER JOIN usuario u ON e."idOrganizador" = u."idUsuario"
       WHERE e."idEvento" = $1
       LIMIT 1`,
      [idEvento],
    );

    if (
      !eventoRaw.length ||
      eventoRaw[0].idEstadoEvento === EstadoEvento.CANCELADO
    ) {
      if (estricto) {
        throw new ConflictException('Evento no encontrado o cancelado.');
      }
      return;
    }

    const evento = eventoRaw[0];

    if (tipo === 'INVITACION_LOGISTICA') {
      const yaAsignado = await this.dataSource.query(
        `SELECT 1 FROM "eventoPersonalLogistica" WHERE "idEvento" = $1 AND "idUsuario" = $2 LIMIT 1`,
        [idEvento, usuario.idUsuario],
      );
      if (yaAsignado.length > 0) return;

      const tieneCupo = await this.validarCapacidadInvitacion(
        idEvento,
        tipo,
        estricto,
      );
      if (!tieneCupo) return;

      await this.dataSource.query(
        `INSERT INTO "eventoPersonalLogistica" ("idEvento", "idUsuario") VALUES ($1, $2)`,
        [idEvento, usuario.idUsuario],
      );

      const nombreColaborador = `${usuario.nombre} ${usuario.apellidoPa}`.trim();
      try {
        await this.mailService.enviarNotificacionOrganizadorLogisticaAceptada({
          destinatario: evento.correoOrg,
          nombreOrganizador: `${evento.nombreOrg} ${evento.apellidoPaOrg}`.trim(),
          nombreColaborador,
          correoColaborador: usuario.correo,
          nombreEvento: evento.nombre,
        });
      } catch {
        // Notificación secundaria al organizador no bloquea el registro
      }

      try {
        await this.mailService.enviarConfirmacionAsignacionLogistica({
          destinatario: usuario.correo,
          nombreUsuario: nombreColaborador,
          nombreEvento: evento.nombre,
        });
      } catch {
        // Confirmación por correo no bloquea la vinculación persistida
      }
      return;
    }

    const yaInvitado = await this.dataSource.query(
      `SELECT 1 FROM "invitacionEvento" WHERE "idEvento" = $1 AND "idUsuario" = $2 LIMIT 1`,
      [idEvento, usuario.idUsuario],
    );
    if (yaInvitado.length > 0) return;

    const tieneCupo = await this.validarCapacidadInvitacion(
      idEvento,
      tipo,
      estricto,
    );
    if (!tieneCupo) return;

    await this.dataSource.query(
      `INSERT INTO "invitacionEvento" ("idEvento", "idUsuario", "fechaUltimoEnvio") VALUES ($1, $2, NOW())`,
      [idEvento, usuario.idUsuario],
    );

    const frontendUrl = (
      process.env.FRONTEND_URL ?? 'http://localhost:5173'
    ).replace(/\/+$/, '');
    try {
      await this.mailService.enviarInvitacionEventoPrivado({
        destinatario: usuario.correo,
        nombreUsuario: `${usuario.nombre} ${usuario.apellidoPa}`.trim(),
        nombreEvento: evento.nombre,
        descripcionEvento: evento.descripcion ?? '',
        organizador: `${evento.nombreOrg} ${evento.apellidoPaOrg}`.trim(),
        enlaceEvento: `${frontendUrl}/eventos/${idEvento}`,
      });
    } catch {
      // Confirmación secundaria no bloquea la vinculación persistida
    }
  }

  private async aplicarInvitacionesPendientesUsuario(
    usuario: UsuarioEntity,
    invitacionToken?: { idEvento: number; tipo: TipoInvitacionCorreo },
  ): Promise<void> {
    const pendientes = consumirInvitacionesPendientes(usuario.correo);
    const procesadas = new Set<string>();

    if (invitacionToken) {
      const clave = `${invitacionToken.tipo}:${invitacionToken.idEvento}`;
      procesadas.add(clave);
      await this.vincularUsuarioAInvitacion(
        usuario,
        invitacionToken.idEvento,
        invitacionToken.tipo,
        true,
      );
    }

    for (const pendiente of pendientes) {
      const clave = `${pendiente.tipo}:${pendiente.idEvento}`;
      if (procesadas.has(clave)) continue;
      procesadas.add(clave);
      await this.vincularUsuarioAInvitacion(
        usuario,
        pendiente.idEvento,
        pendiente.tipo,
        false,
      );
    }
  }

  async registrar(dto?: {
    nombre?: string;
    apellidoPa?: string;
    apellidoMa?: string;
    correo?: string;
    contrasena?: string;
    tokenInvitacion?: string;
  }) {
    const nombre = typeof dto?.nombre === 'string' ? dto.nombre.trim() : '';
    const apellidoPa = typeof dto?.apellidoPa === 'string' ? dto.apellidoPa.trim() : '';
    const apellidoMa = typeof dto?.apellidoMa === 'string' ? dto.apellidoMa.trim() : '';
    const correo = typeof dto?.correo === 'string' ? dto.correo.trim().toLowerCase() : '';
    const contrasenaRaw = typeof dto?.contrasena === 'string' ? dto.contrasena : '';

    // Rechazar campos nulos, vacíos o solo con espacios
    if (
      !nombre ||
      !apellidoPa ||
      !apellidoMa ||
      !correo ||
      !contrasenaRaw.trim()
    ) {
      throw new BadRequestException(
        'Por favor, completa todos los campos obligatorios resaltados para continuar.',
      );
    }

    // Validar longitud máxima de 50 caracteres en Nombre y Apellidos
    if (
      nombre.length > 50 ||
      apellidoPa.length > 50 ||
      apellidoMa.length > 50
    ) {
      throw new BadRequestException(
        'El nombre y los apellidos no pueden exceder los 50 caracteres.',
      );
    }

    // Validar que Nombre y Apellidos contengan únicamente letras
    if (
      !this.SOLO_LETRAS_REGEX.test(nombre) ||
      !this.SOLO_LETRAS_REGEX.test(apellidoPa) ||
      !this.SOLO_LETRAS_REGEX.test(apellidoMa)
    ) {
      throw new BadRequestException(
        'El nombre y los apellidos solo pueden contener letras, sin números ni símbolos especiales.',
      );
    }

    // Validar complejidad de la contraseña antes de enviar el correo
    if (!this.PASSWORD_COMPLEJIDAD_REGEX.test(contrasenaRaw)) {
      throw new BadRequestException(
        'La contraseña debe tener al menos 8 caracteres e incluir letras y números.',
      );
    }

    // Validar que el formato y el dominio del correo realmente existan
    await verificarDominioCorreoValido(correo);

    const tokenInvitacionRaw =
      typeof dto?.tokenInvitacion === 'string'
        ? dto.tokenInvitacion.trim()
        : '';
    const invitacion = tokenInvitacionRaw
      ? await this.decodificarTokenInvitacion(tokenInvitacionRaw)
      : null;

    if (invitacion && invitacion.correo !== correo) {
      throw new BadRequestException(
        'El correo electrónico debe coincidir con el correo de la invitación.',
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

    if (invitacion) {
      await this.validarCapacidadInvitacion(
        invitacion.idEvento,
        invitacion.tipo,
        true,
      );

      const nuevoUsuario = this.usuarioRepository.create({
        nombre,
        apellidoPa,
        apellidoMa,
        correo,
        contrasena: hashedPassword,
        estatus: true,
        esVerificado: EstadoVerificacion.NO_VERIFICADO,
        tipoCuenta: tipoAsignado,
        esJefeAcademia: false,
      });

      const guardado = await this.usuarioRepository.save(nuevoUsuario);
      await this.aplicarInvitacionesPendientesUsuario(guardado, {
        idEvento: invitacion.idEvento,
        tipo: invitacion.tipo,
      });
      TOKEN_BLACKLIST.add(invitacion.token);

      const { contrasena: _contrasena, ...resultado } = guardado;

      return {
        mensaje:
          'Registro exitoso. Tu cuenta ha sido creada y vinculada al evento. Ya puedes iniciar sesión en el sistema.',
        requiereVerificacionCorreo: false,
        correo,
        usuario: resultado,
      };
    }

    const payload = {
      tipo: 'CONFIRMACION_REGISTRO',
      nombre,
      apellidoPa,
      apellidoMa,
      correo,
      contrasenaHash: hashedPassword,
      tipoCuenta: tipoAsignado,
    };

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_PASS || 'clave_secreta',
      expiresIn: '15m',
    });

    const frontendUrl = (process.env.FRONTEND_URL ?? 'http://localhost:5173').replace(/\/+$/, '');
    // Ruta hacia la pantalla de confirmación de registro en el frontend
    const enlaceConfirmacion = `${frontendUrl}/confirmar-registro?token=${encodeURIComponent(token)}`;

    try {
      await this.mailService.enviarCorreoConfirmacionRegistro({
        destinatario: correo,
        nombreUsuario: `${nombre} ${apellidoPa}`.trim(),
        tipoCuenta: tipoAsignado,
        enlaceConfirmacion,
      });
    } catch {
      throw new InternalServerErrorException(
        'No se pudo enviar el correo de verificación. Verifica tu dirección o inténtalo de nuevo más tarde.',
      );
    }

    return {
      mensaje:
        'Te hemos enviado un correo de verificación. Haz clic en el enlace enviado a tu bandeja para completar tu registro.',
      requiereVerificacionCorreo: true,
      correo,
      token: process.env.NODE_ENV === 'production' ? undefined : token,
    };
  }

  // Confirmar el correo electrónico mediante el token y crear la cuenta en la base de datos
  async confirmarRegistro(tokenRaw?: string) {
    const token = tokenRaw?.trim() ?? '';
    if (!token || TOKEN_BLACKLIST.has(token)) {
      throw new BadRequestException(
        'El enlace de verificación es inválido, ya fue utilizado o ha expirado.',
      );
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(token, {
        secret: process.env.JWT_PASS || 'clave_secreta',
      });
    } catch {
      throw new BadRequestException(
        'El enlace de verificación es inválido, ya fue utilizado o ha expirado.',
      );
    }

    if (
      !payload ||
      payload.tipo !== 'CONFIRMACION_REGISTRO' ||
      !payload.correo ||
      !payload.contrasenaHash ||
      !payload.nombre ||
      !payload.apellidoPa
    ) {
      throw new BadRequestException(
        'El enlace de verificación no es válido para activar una cuenta.',
      );
    }

    const correo = String(payload.correo).trim().toLowerCase();

    const existe = await this.usuarioRepository.findOne({
      where: { correo },
    });

    if (existe) {
      TOKEN_BLACKLIST.add(token);
      throw new ConflictException(
        'Esta cuenta ya fue verificada y registrada anteriormente. Ya puedes iniciar sesión.',
      );
    }

    const nuevoUsuario = this.usuarioRepository.create({
      nombre: String(payload.nombre).trim(),
      apellidoPa: String(payload.apellidoPa).trim(),
      apellidoMa: payload.apellidoMa ? String(payload.apellidoMa).trim() : null,
      correo,
      contrasena: String(payload.contrasenaHash),
      estatus: true,
      esVerificado: EstadoVerificacion.NO_VERIFICADO,
      tipoCuenta: payload.tipoCuenta ?? TipoCuentaUsuario.EXTERNO,
      esJefeAcademia: false,
    });

    const guardado = await this.usuarioRepository.save(nuevoUsuario);
    TOKEN_BLACKLIST.add(token);
    await this.aplicarInvitacionesPendientesUsuario(guardado);

    const { contrasena: _contrasena, ...resultado } = guardado;

    return {
      mensaje:
        'Registro exitoso. Tu correo electrónico ha sido verificado y ya puedes iniciar sesión en el sistema.',
      usuario: resultado,
    };
  }

  async login(dto?: {
    correo?: string;
    contrasena?: string;
    captchaToken?: string;
  }) {
    if (!dto || typeof dto !== 'object') {
      throw new BadRequestException(
        'Por favor, completa todos los campos obligatorios.',
      );
    }

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

    const correoLimpio =
      typeof dto.correo === 'string' ? dto.correo.trim().toLowerCase() : '';
    const contrasenaInput =
      typeof dto.contrasena === 'string' ? dto.contrasena : '';
    if (!correoLimpio || !contrasenaInput) {
      throw new BadRequestException(
        'Por favor, completa todos los campos obligatorios.',
      );
    }
    const usuario = await this.usuarioRepository.findOne({
      where: { correo: correoLimpio },
    });

    if (!usuario || !usuario.contrasena) {
      throw new UnauthorizedException(
        'Credenciales incorrectas o inexistentes.',
      );
    }

    // Si la cuenta está deshabilitada, se informa al usuario que puede contactar al administrador
    if (!usuario.estatus) {
      throw new UnauthorizedException(
        'La cuenta se encuentra deshabilitada. Si consideras que se trata de un error, contacta al administrador para solicitar su habilitación.',
      );
    }

    if (
      usuario.tipoCuenta === TipoCuentaUsuario.ADMINISTRADOR &&
      usuario.bloqueadoHasta
    ) {
      const ahora = new Date();
      if (ahora < new Date(usuario.bloqueadoHasta)) {
        throw new UnauthorizedException(
          'Cuenta bloqueada temporalmente por seguridad tras múltiples intentos fallidos. Intente más tarde.',
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
            'Demasiados intentos fallidos. La cuenta de Administrador ha sido bloqueada temporalmente por 30 minutos.',
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

  // Solicitar enlace de recuperación de contraseña (15 minutos)
  async solicitarRecuperacionContrasena(dto: SolicitarRecuperacionDto) {
    const correo = dto.correo?.trim().toLowerCase() ?? '';
    if (!correo) {
      throw new BadRequestException(
        'Por favor, ingresa tu correo electrónico.',
      );
    }

    if (!EMAIL_REGEX.test(correo)) {
      throw new BadRequestException('Advertencia: Ingrese un correo válido.');
    }

    const usuario = await this.usuarioRepository.findOne({
      where: { correo },
    });

    if (!usuario || !usuario.contrasena) {
      throw new NotFoundException(
        'El correo electrónico ingresado no se encuentra registrado en el sistema.',
      );
    }

    if (!usuario.estatus) {
      throw new BadRequestException(
        'La cuenta asociada a este correo se encuentra deshabilitada. Contacta al administrador para solicitar su habilitación.',
      );
    }

    const payload = {
      sub: usuario.idUsuario,
      correo: usuario.correo,
      tipo: 'RECUPERACION_CONTRASENA',
      pwdRef: usuario.contrasena.slice(-12),
    };

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_PASS || 'clave_secreta',
      expiresIn: '15m',
    });

    const frontendUrl = (process.env.FRONTEND_URL ?? 'http://localhost:5173').replace(/\/+$/, '');
    // Lo mande a restablecer-contrasena, si el frontend cambia la ruta, solo hay que cambiarla aquí
    const enlaceRecuperacion = `${frontendUrl}/restablecer-contrasena?token=${encodeURIComponent(token)}`;

    const nombreUsuario =
      `${usuario.nombre} ${usuario.apellidoPa}`.trim() || 'Usuario';

    try {
      await this.mailService.enviarCorreoRecuperacionContrasena({
        destinatario: usuario.correo,
        nombreUsuario,
        enlaceRecuperacion,
      });
    } catch {
      throw new InternalServerErrorException(
        'El correo no se pudo enviar, inténtelo de nuevo más tarde.',
      );
    }

    return {
      mensaje:
        'Correo enviado con éxito. Revisa tu bandeja de entrada para restablecer tu contraseña.',
      token: process.env.NODE_ENV === 'production' ? undefined : token,
    };
  }

  // Validar vigencia e integridad del token
  async validarTokenRecuperacion(tokenRaw?: string) {
    const token = tokenRaw?.trim() ?? '';
    if (!token || TOKEN_BLACKLIST.has(token)) {
      throw new BadRequestException(
        'El enlace de recuperación es inválido, ya fue utilizado o ha expirado.',
      );
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(token, {
        secret: process.env.JWT_PASS || 'clave_secreta',
      });
    } catch {
      throw new BadRequestException(
        'El enlace de recuperación es inválido, ya fue utilizado o ha expirado.',
      );
    }

    if (
      !payload ||
      payload.tipo !== 'RECUPERACION_CONTRASENA' ||
      !payload.sub
    ) {
      throw new BadRequestException(
        'El enlace de recuperación es inválido, ya fue utilizado o ha expirado.',
      );
    }

    const usuario = await this.usuarioRepository.findOne({
      where: { idUsuario: Number(payload.sub) },
    });

    if (
      !usuario ||
      !usuario.estatus ||
      !usuario.contrasena ||
      usuario.contrasena.slice(-12) !== payload.pwdRef
    ) {
      throw new BadRequestException(
        'El enlace de recuperación es inválido, ya fue utilizado o ha expirado.',
      );
    }

    return {
      valido: true,
      mensaje: 'Token válido.',
    };
  }

  // Restablecer contraseña
  async restablecerContrasena(dto: RestablecerContrasenaDto) {
    const token = dto.token?.trim() ?? '';
    const nuevaContrasena = dto.nuevaContrasena ?? '';
    const confirmarContrasena = dto.confirmarContrasena ?? '';

    // Validar que el token no haya expirado ni haya sido reutilizado
    if (!token || TOKEN_BLACKLIST.has(token)) {
      throw new BadRequestException(
        'El enlace de recuperación es inválido, ya fue utilizado o ha expirado.',
      );
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(token, {
        secret: process.env.JWT_PASS || 'clave_secreta',
      });
    } catch {
      throw new BadRequestException(
        'El enlace de recuperación es inválido, ya fue utilizado o ha expirado.',
      );
    }

    if (
      !payload ||
      payload.tipo !== 'RECUPERACION_CONTRASENA' ||
      !payload.sub
    ) {
      throw new BadRequestException(
        'El enlace de recuperación es inválido, ya fue utilizado o ha expirado.',
      );
    }

    const usuario = await this.usuarioRepository.findOne({
      where: { idUsuario: Number(payload.sub) },
    });

    if (
      !usuario ||
      !usuario.estatus ||
      !usuario.contrasena ||
      usuario.contrasena.slice(-12) !== payload.pwdRef
    ) {
      throw new BadRequestException(
        'El enlace de recuperación es inválido, ya fue utilizado o ha expirado.',
      );
    }

    // Validar campos vacíos o contraseña insegura
    if (
      !nuevaContrasena.trim() ||
      !confirmarContrasena.trim() ||
      !this.PASSWORD_COMPLEJIDAD_REGEX.test(nuevaContrasena)
    ) {
      throw new BadRequestException(
        'La contraseña debe tener al menos 8 caracteres e incluir letras y números.',
      );
    }

    // Validar que ambas contraseñas coincidan exactamente
    if (nuevaContrasena !== confirmarContrasena) {
      throw new BadRequestException(
        'Las contraseñas ingresadas no coinciden.',
      );
    }

    // Validar que la nueva contraseña no sea igual a la contraseña actual
    const esMismaContrasena = await bcrypt.compare(
      nuevaContrasena,
      usuario.contrasena,
    );
    if (esMismaContrasena) {
      throw new BadRequestException(
        'La nueva contraseña debe ser diferente a la contraseña anterior.',
      );
    }

    // Hashear nueva contraseña, invalidar token y levantar bloqueo si existía
    const saltRounds = 10;
    usuario.contrasena = await bcrypt.hash(nuevaContrasena, saltRounds);
    usuario.intentosFallidos = 0;
    usuario.bloqueadoHasta = null;

    await this.usuarioRepository.save(usuario);
    TOKEN_BLACKLIST.add(token);

    return {
      mensaje: 'Operación realizada con éxito.',
    };
  }

  async activarCuentaLogistica(dto: ActivarCuentaLogisticaDto) {
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.token, {
        secret: process.env.JWT_PASS || 'clave_secreta',
      });
    } catch (_err) {
      throw new BadRequestException(
        'El token de invitación es inválido o ha expirado.',
      );
    }

    if (
      !payload ||
      payload.tipo !== 'INVITACION_LOGISTICA' ||
      !payload.correo ||
      !payload.idEvento
    ) {
      throw new BadRequestException(
        'El token proporcionado no es válido para activación de logística.',
      );
    }

    const correo = String(payload.correo).toLowerCase().trim();
    const idEvento = Number(payload.idEvento);

    const evento = await this.dataSource.query(
      `SELECT "idEvento", nombre, "idEstadoEvento" FROM evento WHERE "idEvento" = $1 LIMIT 1`,
      [idEvento],
    );
    if (!evento.length || evento[0].idEstadoEvento === EstadoEvento.CANCELADO) {
      throw new ConflictException('Evento no encontrado o cancelado.');
    }

    const conteo = await this.dataSource.query(
      `SELECT COUNT(*)::int AS total FROM "eventoPersonalLogistica" WHERE "idEvento" = $1`,
      [idEvento],
    );
    if ((conteo[0]?.total ?? 0) >= 10) {
      throw new BadRequestException(
        'No es posible registrar más personal de logística. El evento ha alcanzado el límite máximo de 10 integrantes.',
      );
    }

    let usuario = await this.usuarioRepository.findOneBy({ correo });

    if (!usuario) {
      const nombre = dto.nombre.trim();
      const apellidoPa = dto.apellidoPa.trim();
      const apellidoMa = dto.apellidoMa ? dto.apellidoMa.trim() : null;

      if (
        !this.SOLO_LETRAS_REGEX.test(nombre) ||
        !this.SOLO_LETRAS_REGEX.test(apellidoPa)
      ) {
        throw new BadRequestException(
          'El nombre y los apellidos solo deben contener letras.',
        );
      }
      if (apellidoMa && !this.SOLO_LETRAS_REGEX.test(apellidoMa)) {
        throw new BadRequestException(
          'El apellido materno solo debe contener letras.',
        );
      }

      if (dto.contrasena.length < 8) {
        throw new BadRequestException(
          'La contraseña debe contener al menos 8 caracteres.',
        );
      }

      const esInterno =
        correo.endsWith('@ipn.mx') || correo.endsWith('@alumno.ipn.mx');
      const tipoCuenta = esInterno
        ? TipoCuentaUsuario.INTERNO
        : TipoCuentaUsuario.EXTERNO;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(dto.contrasena, salt);

      usuario = this.usuarioRepository.create({
        nombre,
        apellidoPa,
        apellidoMa: apellidoMa || null,
        correo,
        contrasena: hashedPassword,
        tipoCuenta,
        estatus: true,
        esJefeAcademia: false,
      });

      usuario = await this.usuarioRepository.save(usuario);
    }

    const yaAsignado = await this.dataSource.query(
      `SELECT 1 FROM "eventoPersonalLogistica" WHERE "idEvento" = $1 AND "idUsuario" = $2 LIMIT 1`,
      [idEvento, usuario.idUsuario],
    );

    if (!yaAsignado.length) {
      await this.dataSource.query(
        `INSERT INTO "eventoPersonalLogistica" ("idEvento", "idUsuario") VALUES ($1, $2)`,
        [idEvento, usuario.idUsuario],
      );
    }

    const organizadorRaw = await this.dataSource.query(
      `SELECT u.correo, u.nombre, u."apellidoPa"
       FROM evento e
       INNER JOIN usuario u ON e."idOrganizador" = u."idUsuario"
       WHERE e."idEvento" = $1 LIMIT 1`,
      [idEvento],
    );

    if (organizadorRaw.length > 0) {
      const org = organizadorRaw[0];
      const nombreColaborador =
        `${usuario.nombre} ${usuario.apellidoPa}`.trim();
      void this.mailService.enviarNotificacionOrganizadorLogisticaAceptada({
        destinatario: org.correo,
        nombreOrganizador: `${org.nombre} ${org.apellidoPa}`.trim(),
        nombreColaborador,
        correoColaborador: usuario.correo,
        nombreEvento: evento[0].nombre,
      });
    }

    void this.mailService.enviarConfirmacionAsignacionLogistica({
      destinatario: usuario.correo,
      nombreUsuario: `${usuario.nombre} ${usuario.apellidoPa}`.trim(),
      nombreEvento: evento[0].nombre,
    });

    const sessionPayload = {
      sub: usuario.idUsuario,
      correo: usuario.correo,
      tipoCuenta: usuario.tipoCuenta,
      esJefeAcademia: usuario.esJefeAcademia,
    };
    const accessToken = this.jwtService.sign(sessionPayload);

    const { contrasena: _contrasena, ...datosUsuario } = usuario;
    return {
      mensaje: 'Operación realizada con éxito.',
      access_token: accessToken,
      usuario: datosUsuario,
    };
  }
}