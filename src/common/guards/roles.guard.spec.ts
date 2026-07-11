import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolUsuario } from '@prisma/client';
import { RolesGuard } from './roles.guard';
import { AuthenticatedUser } from '../../modules/auth/auth.types';

function contextConUsuario(user: Partial<AuthenticatedUser>): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('permite el acceso si la ruta no tiene @Roles()', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const ctx = contextConUsuario({ rol: RolUsuario.VENDEDOR });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('permite el acceso si @Roles() está vacío', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
    const ctx = contextConUsuario({ rol: RolUsuario.VENDEDOR });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('permite el acceso si el rol del usuario está en la lista requerida', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([RolUsuario.ADMIN, RolUsuario.ENCARGADO]);
    const ctx = contextConUsuario({ rol: RolUsuario.ENCARGADO });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('bloquea el acceso si el rol del usuario NO está en la lista requerida', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([RolUsuario.ADMIN, RolUsuario.ENCARGADO]);
    const ctx = contextConUsuario({ rol: RolUsuario.VENDEDOR });

    expect(guard.canActivate(ctx)).toBe(false);
  });
});
