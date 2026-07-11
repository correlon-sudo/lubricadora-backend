import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RolUsuario } from '@prisma/client';
import { AuthenticatedUser } from '../../modules/auth/auth.types';

/**
 * Restringe a usuarios no-ADMIN a los datos de su propia sucursal.
 * Aplica si el request trae `sucursalId` en params, query o body;
 * si no lo trae, no hay nada que restringir en esta capa (el service
 * debe scopear la query por `user.sucursalId` de todos modos).
 */
@Injectable()
export class SucursalScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{
        user: AuthenticatedUser;
        params: Record<string, string>;
        query: Record<string, string>;
        body: Record<string, unknown>;
      }>();

    const { user } = request;
    if (user.rol === RolUsuario.ADMIN) return true;

    const sucursalId =
      request.params?.sucursalId ??
      request.query?.sucursalId ??
      (request.body?.sucursalId as string | undefined);

    if (sucursalId && sucursalId !== user.sucursalId) {
      throw new ForbiddenException('No tenés acceso a datos de otra sucursal');
    }

    return true;
  }
}
