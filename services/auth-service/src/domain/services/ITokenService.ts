import type { IJwtPayload, UserRole } from "workbee-common";

/** token service interface */

export interface ITokenService {
    generateAccess(id: string, role?: UserRole): string;
    generateRefresh(id: string, role?: UserRole): string;

    verifyAccess(token: string): IJwtPayload;
    verifyRefresh(token: string): IJwtPayload;

    storeRefreshToken(userId: string, token: string, expiresIn?: number): Promise<void>;
    getRefreshToken(userId: string): Promise<string | null>;
    deleteRefreshToken(userId: string): Promise<void>;
    validateRefreshToken(userId: string, token: string): Promise<boolean>;
}