import { OAuth2Client } from "google-auth-library";
import { NewUser } from "../../../domain/entities/User";
import { inject, injectable } from "tsyringe";

import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { ITokenService } from "../../../domain/services/ITokenService";
import { GoogleLoginRequestDTO, GoogleLoginResponseDTO } from "../../dtos/user/GoogleLoginDTO";
import { UserMapper } from "../../mappers/UserMapper";
import { IGoogleLoginUserUseCase } from "../../ports/user/IGoogleLoginUserUseCase";
import { UserRole } from "workbee-common";
import { ErrorMessages } from "../../../shared/constants/ErrorMessages";
import { ENV } from "../../../infrastructure/config/env";

const clientId = new OAuth2Client(ENV.GOOGLE_CLIENT_ID)

@injectable()
export class GoogleLoginUserUseCase implements IGoogleLoginUserUseCase{
    constructor(
        @inject("UserRepository") private readonly _userRepository: IUserRepository,
        @inject("TokenService") private readonly _tokenService: ITokenService
    ){}

    async execute(data: GoogleLoginRequestDTO): Promise<GoogleLoginResponseDTO>{
        const { credential } = data;
        const ticket = await clientId.verifyIdToken({
            idToken: credential,
            audience: ENV.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        if(!payload) throw new Error(ErrorMessages.AUTH.INVALID_GOOGLE_CREDN);

        const { email, name } = payload;
        let user = await this._userRepository.findByEmail(email!);

        if(!user){
            const newUser: NewUser = {
                name: name || 'Google Auth User',
                email: email!,
                isVerified: true,
                role: UserRole.USER
            };
            user = await this._userRepository.save(newUser);
        }

        // gen access and refresh tokens
        const accessToken = this._tokenService.generateAccess(user.id!, user.role as UserRole);
        const refreshToken = this._tokenService.generateRefresh(user.id!, user.role as UserRole);

        // store refresh token in redis
        await this._tokenService.storeRefreshToken(user.id!, refreshToken);

        return UserMapper.toGoogleLoginResponse(user, accessToken, refreshToken);
    }
}