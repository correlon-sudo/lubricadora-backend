import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../config/prisma.service';
import { ROL_PERMISOS, ROL_PRIORIDAD, parseTtlToSeconds } from './auth.constants';

// bcrypt trunca el input a 72 bytes: dos JWT del mismo usuario comparten
// header + prefijo del payload (sub/username/sucursalId), y la parte que
// cambia (jti/iat/exp/firma) cae después del byte 72 — con bcrypt, TODOS
// los refresh tokens de un usuario hashean igual y la revocación no sirve.
// SHA-256 no trunca y es el estándar para hashear tokens opacos de alta
// entropía (bcrypt es para passwords de baja entropía, no para esto).
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(username: string, password: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { username },
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValida = await bcrypt.compare(
      password,
      usuario.passwordHash,
    );
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.emitirSesion(usuario.id, usuario.username, usuario.sucursalId, usuario.rol, usuario.nombres, usuario.apellidos, usuario.email);
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = this.jwt.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
    });
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const tokenMatch = await this.prisma.refreshToken.findFirst({
      where: {
        usuarioId: usuario.id,
        tokenHash: hashToken(refreshToken),
        revocado: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!tokenMatch) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    // Rotación: revocar el usado, emitir uno nuevo
    await this.prisma.refreshToken.update({
      where: { id: tokenMatch.id },
      data: { revocado: true },
    });

    return this.emitirSesion(usuario.id, usuario.username, usuario.sucursalId, usuario.rol, usuario.nombres, usuario.apellidos, usuario.email);
  }

  async logout(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = this.jwt.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      return { success: true };
    }

    await this.prisma.refreshToken.updateMany({
      where: {
        usuarioId: payload.sub,
        tokenHash: hashToken(refreshToken),
        revocado: false,
      },
      data: { revocado: true },
    });

    return { success: true };
  }

  async me(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUniqueOrThrow({
      where: { id: usuarioId },
    });
    return this.serializarUsuario(
      usuario.id,
      usuario.username,
      usuario.rol,
      usuario.nombres,
      usuario.apellidos,
      usuario.email,
    );
  }

  private async emitirSesion(
    usuarioId: string,
    username: string,
    sucursalId: string,
    rol: keyof typeof ROL_PRIORIDAD,
    nombres: string,
    apellidos: string,
    email: string,
  ) {
    const payload = { sub: usuarioId, username, sucursalId, rol };

    const accessTtlSeconds = parseTtlToSeconds(process.env.JWT_ACCESS_TTL ?? '15m');
    const refreshTtlSeconds = parseTtlToSeconds(process.env.JWT_REFRESH_TTL ?? '7d');

    const accessToken = this.jwt.sign(
      { ...payload, jti: randomUUID() },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: accessTtlSeconds },
    );
    // jti único: sin esto, dos refresh tokens firmados en el mismo segundo
    // (mismo payload + mismo iat/exp) resultan en strings idénticos, y la
    // revocación por rotación deja de invalidar el token anterior.
    const refreshToken = this.jwt.sign(
      { ...payload, jti: randomUUID() },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: refreshTtlSeconds },
    );

    const refreshHash = hashToken(refreshToken);
    const expiresInSeconds = refreshTtlSeconds;
    await this.prisma.refreshToken.create({
      data: {
        usuarioId,
        tokenHash: refreshHash,
        expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
      },
    });

    return {
      token: {
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: accessTtlSeconds,
        refresh_token: refreshToken,
      },
      user: this.serializarUsuario(usuarioId, username, rol, nombres, apellidos, email),
    };
  }

  private serializarUsuario(
    id: string,
    username: string,
    rol: keyof typeof ROL_PRIORIDAD,
    nombres: string,
    apellidos: string,
    email: string,
  ) {
    return {
      id,
      username,
      name: `${nombres} ${apellidos}`,
      email,
      avatar: '',
      roles: [{ name: rol, priority: ROL_PRIORIDAD[rol] }],
      permissions: ROL_PERMISOS[rol],
    };
  }
}
