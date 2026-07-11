import { RolUsuario } from '@prisma/client';

/** Prioridad ascendente = mayor jerarquía (coincide con la convención del template frontend). */
export const ROL_PRIORIDAD: Record<RolUsuario, number> = {
  ADMIN: 1,
  ENCARGADO: 2,
  VENDEDOR: 3,
};

/** Permisos por rol (usados por ngx-permissions en el frontend). */
export const ROL_PERMISOS: Record<RolUsuario, string[]> = {
  ADMIN: ['canAdd', 'canEdit', 'canDelete', 'canRead'],
  ENCARGADO: ['canAdd', 'canEdit', 'canRead'],
  VENDEDOR: ['canAdd', 'canRead'],
};

export function parseTtlToSeconds(ttl: string): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(ttl);
  if (!match) {
    throw new Error(`TTL inválido: "${ttl}" (formato esperado: 15m, 7d, etc.)`);
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };
  return value * multipliers[unit];
}
