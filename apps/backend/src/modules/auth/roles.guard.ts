import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new ForbiddenException('Acceso denegado. No se proporcionó token de autenticación (HTTP 403).');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new ForbiddenException('Formato de token inválido (HTTP 403).');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_PASS || 'clave_secreta',
      });

      request.user = payload;

      const rolesRequeridos = this.reflector.get<string[]>('roles', context.getHandler());
      if (rolesRequeridos && rolesRequeridos.length > 0) {
        const tieneRol = rolesRequeridos.includes(payload.tipoCuenta);
        if (!tieneRol) {
          throw new ForbiddenException('No cuentas con los permisos suficientes para acceder a este recurso (HTTP 403).');
        }
      }

      return true;
    } catch (error) {
      throw new ForbiddenException('Token inválido, expirado o acceso no autorizado (HTTP 403).');
    }
  }
}