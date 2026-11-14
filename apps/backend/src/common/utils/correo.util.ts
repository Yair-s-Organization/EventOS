import { BadRequestException } from '@nestjs/common';
import { resolveMx } from 'dns/promises';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type TipoInvitacionCorreo =
  | 'INVITACION_LOGISTICA'
  | 'INVITACION_EVENTO_PRIVADO';

export interface InvitacionPendienteRegistro {
  idEvento: number;
  tipo: TipoInvitacionCorreo;
  expiraEn: number;
}

const INVITACIONES_PENDIENTES = new Map<
  string,
  InvitacionPendienteRegistro[]
>();

/**
 * Verifica que el correo tenga formato válido y que su dominio cuente con registros MX.
 */
export async function verificarDominioCorreoValido(
  correo: string,
): Promise<void> {
  if (!EMAIL_REGEX.test(correo)) {
    throw new BadRequestException('Advertencia: Ingrese un correo válido.');
  }

  const dominio = correo.split('@')[1];
  try {
    const registrosMx = await resolveMx(dominio);
    if (!registrosMx || registrosMx.length === 0) {
      throw new Error('Sin registros MX');
    }
  } catch {
    throw new BadRequestException(
      `El dominio del correo (@${dominio}) no existe o no cuenta con un servidor de correo válido. Verifica tu dirección.`,
    );
  }
}

/**
 * Registra o renueva una invitación pendiente para un correo aún no registrado.
 */
export function registrarInvitacionPendiente(
  correoRaw: string,
  idEvento: number,
  tipo: TipoInvitacionCorreo,
  ttlMs = 48 * 60 * 60 * 1000,
): void {
  const correo = correoRaw.trim().toLowerCase();
  const ahora = Date.now();
  const vigentes = (INVITACIONES_PENDIENTES.get(correo) ?? []).filter(
    (item) => item.expiraEn > ahora && !(item.idEvento === idEvento && item.tipo === tipo),
  );
  vigentes.push({ idEvento, tipo, expiraEn: ahora + ttlMs });
  INVITACIONES_PENDIENTES.set(correo, vigentes);
}

/**
 * Obtiene y consume las invitaciones pendientes vigentes para un correo recién activado.
 */
export function consumirInvitacionesPendientes(
  correoRaw: string,
): InvitacionPendienteRegistro[] {
  const correo = correoRaw.trim().toLowerCase();
  const ahora = Date.now();
  const vigentes = (INVITACIONES_PENDIENTES.get(correo) ?? []).filter(
    (item) => item.expiraEn > ahora,
  );
  INVITACIONES_PENDIENTES.delete(correo);
  return vigentes;
}

