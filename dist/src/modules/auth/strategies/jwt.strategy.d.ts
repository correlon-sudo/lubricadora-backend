import { Strategy } from 'passport-jwt';
import { AuthenticatedUser } from '../auth.types';
interface JwtPayload {
    sub: string;
    username: string;
    sucursalId: string;
    rol: AuthenticatedUser['rol'];
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: JwtPayload): AuthenticatedUser;
}
export {};
