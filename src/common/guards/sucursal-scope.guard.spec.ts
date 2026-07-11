import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolUsuario } from '@prisma/client';
import { SucursalScopeGuard } from './sucursal-scope.guard';
import { AuthenticatedUser } from '../../modules/auth/auth.types';

function contextConRequest(
  user: Partial<AuthenticatedUser>,
  overrides: { params?: Record<string, string>; query?: Record<string, string>; body?: Record<string, unknown> } = {},
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user,
        params: overrides.params ?? {},
        query: overrides.query ?? {},
        body: overrides.body ?? {},
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('SucursalScopeGuard', () => {
  const guard = new SucursalScopeGuard();

  it('permite ADMIN sin importar la sucursal solicitada', () => {
    const ctx = contextConRequest(
      { rol: RolUsuario.ADMIN, sucursalId: 'sucursal-propia' },
      { query: { sucursalId: 'otra-sucursal' } },
    );

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('permite no-admin cuando el request no trae sucursalId', () => {
    const ctx = contextConRequest({ rol: RolUsuario.ENCARGADO, sucursalId: 'sucursal-propia' });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('permite no-admin cuando pide su propia sucursal', () => {
    const ctx = contextConRequest(
      { rol: RolUsuario.ENCARGADO, sucursalId: 'sucursal-propia' },
      { query: { sucursalId: 'sucursal-propia' } },
    );

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('bloquea no-admin que pide otra sucursal por query', () => {
    const ctx = contextConRequest(
      { rol: RolUsuario.ENCARGADO, sucursalId: 'sucursal-propia' },
      { query: { sucursalId: 'sucursal-ajena' } },
    );

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('bloquea no-admin que pide otra sucursal por params', () => {
    const ctx = contextConRequest(
      { rol: RolUsuario.VENDEDOR, sucursalId: 'sucursal-propia' },
      { params: { sucursalId: 'sucursal-ajena' } },
    );

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('bloquea no-admin que pide otra sucursal por body', () => {
    const ctx = contextConRequest(
      { rol: RolUsuario.VENDEDOR, sucursalId: 'sucursal-propia' },
      { body: { sucursalId: 'sucursal-ajena' } },
    );

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('prioriza params sobre query si ambos vienen', () => {
    const ctx = contextConRequest(
      { rol: RolUsuario.ENCARGADO, sucursalId: 'sucursal-propia' },
      { params: { sucursalId: 'sucursal-propia' }, query: { sucursalId: 'sucursal-ajena' } },
    );

    // gana params (coincide con la propia) -> no debe tirar
    expect(guard.canActivate(ctx)).toBe(true);
  });
});
