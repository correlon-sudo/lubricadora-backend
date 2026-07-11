"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROL_PERMISOS = exports.ROL_PRIORIDAD = void 0;
exports.parseTtlToSeconds = parseTtlToSeconds;
exports.ROL_PRIORIDAD = {
    ADMIN: 1,
    ENCARGADO: 2,
    VENDEDOR: 3,
};
exports.ROL_PERMISOS = {
    ADMIN: ['canAdd', 'canEdit', 'canDelete', 'canRead'],
    ENCARGADO: ['canAdd', 'canEdit', 'canRead'],
    VENDEDOR: ['canAdd', 'canRead'],
};
function parseTtlToSeconds(ttl) {
    const match = /^(\d+)(s|m|h|d)$/.exec(ttl);
    if (!match) {
        throw new Error(`TTL inválido: "${ttl}" (formato esperado: 15m, 7d, etc.)`);
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers = {
        s: 1,
        m: 60,
        h: 3600,
        d: 86400,
    };
    return value * multipliers[unit];
}
//# sourceMappingURL=auth.constants.js.map