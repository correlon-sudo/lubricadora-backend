"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../../config/prisma.service");
const auth_constants_1 = require("./auth.constants");
function hashToken(token) {
    return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
}
let AuthService = class AuthService {
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async login(username, password) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { username },
        });
        if (!usuario || !usuario.activo) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
        if (!passwordValida) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        return this.emitirSesion(usuario.id, usuario.username, usuario.sucursalId, usuario.rol, usuario.nombres, usuario.apellidos, usuario.email);
    }
    async refresh(refreshToken) {
        let payload;
        try {
            payload = this.jwt.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Refresh token inválido o expirado');
        }
        const usuario = await this.prisma.usuario.findUnique({
            where: { id: payload.sub },
        });
        if (!usuario || !usuario.activo) {
            throw new common_1.UnauthorizedException('Usuario no encontrado');
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
            throw new common_1.UnauthorizedException('Refresh token inválido o expirado');
        }
        await this.prisma.refreshToken.update({
            where: { id: tokenMatch.id },
            data: { revocado: true },
        });
        return this.emitirSesion(usuario.id, usuario.username, usuario.sucursalId, usuario.rol, usuario.nombres, usuario.apellidos, usuario.email);
    }
    async logout(refreshToken) {
        let payload;
        try {
            payload = this.jwt.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
        }
        catch {
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
    async me(usuarioId) {
        const usuario = await this.prisma.usuario.findUniqueOrThrow({
            where: { id: usuarioId },
        });
        return this.serializarUsuario(usuario.id, usuario.username, usuario.rol, usuario.nombres, usuario.apellidos, usuario.email);
    }
    async emitirSesion(usuarioId, username, sucursalId, rol, nombres, apellidos, email) {
        const payload = { sub: usuarioId, username, sucursalId, rol };
        const accessTtlSeconds = (0, auth_constants_1.parseTtlToSeconds)(process.env.JWT_ACCESS_TTL ?? '15m');
        const refreshTtlSeconds = (0, auth_constants_1.parseTtlToSeconds)(process.env.JWT_REFRESH_TTL ?? '7d');
        const accessToken = this.jwt.sign({ ...payload, jti: (0, crypto_1.randomUUID)() }, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: accessTtlSeconds });
        const refreshToken = this.jwt.sign({ ...payload, jti: (0, crypto_1.randomUUID)() }, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: refreshTtlSeconds });
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
    serializarUsuario(id, username, rol, nombres, apellidos, email) {
        return {
            id,
            username,
            name: `${nombres} ${apellidos}`,
            email,
            avatar: '',
            roles: [{ name: rol, priority: auth_constants_1.ROL_PRIORIDAD[rol] }],
            permissions: auth_constants_1.ROL_PERMISOS[rol],
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map