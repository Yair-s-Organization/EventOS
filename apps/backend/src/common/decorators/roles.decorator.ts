import { SetMetadata } from '@nestjs/common';
import type { TipoCuentaUsuario } from '@eventos/shared';

// Define los tipos de cuenta autorizados; leído por RolesGuard con la clave 'roles'
export const Roles = (...roles: TipoCuentaUsuario[]) => SetMetadata('roles', roles);
