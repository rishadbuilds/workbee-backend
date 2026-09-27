import { injectable, inject } from "tsyringe";
import { ErrorMessages } from "../../../shared/constants/ErrorMessages";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { ITokenService } from "../../../domain/services/ITokenService";
import { IRefreshTokenUseCase } from "../../ports/user/IRefreshTokenUseCase";
import { RefreshTokenRequestDTO, RefreshTokenResponseDTO } from "../../dtos/user/RefreshTokenDTO";
import { IJwtPayload, UserRole } from "workbee-common";

@injectable()
export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(
    @inject("UserRepository") private readonly _userRepository: IUserRepository,
    @inject("TokenService") private readonly _tokenService: ITokenService
  ) { }

  async execute(data: RefreshTokenRequestDTO): Promise<RefreshTokenResponseDTO> {
    const { refreshToken } = data;

    let payload: IJwtPayload;
    
    try {
      payload = this._tokenService.verifyRefresh(refreshToken);
    } catch {
      throw new Error(ErrorMessages.AUTH.INVALID_REFRESH_TOKEN);
    }

    const userId = payload.userId;
    const role = payload.role;

    const isValid = await this._tokenService.validateRefreshToken(userId, refreshToken);
    if (!isValid) {
      throw new Error(ErrorMessages.AUTH.REFRESH_TOKEN_NOT_FOUND);
    }

    if (role === UserRole.USER) {
      const user = await this._userRepository.findById(userId);
      if (!user) throw new Error(ErrorMessages.USER.NOT_FOUND);
      if (!user.isVerified) throw new Error(ErrorMessages.USER.NOT_VERIFIED);
      if (user.isBlocked) throw new Error(ErrorMessages.USER.BLOCKED);

    } else if (role === UserRole.ADMIN) {
      const admin = await this._userRepository.findById(userId);
      if (!admin) throw new Error(ErrorMessages.USER.NOT_FOUND);

    }

    // gen new access and refresh tokens
    const newAccessToken = this._tokenService.generateAccess(userId, role as UserRole);
    const newRefreshToken = this._tokenService.generateRefresh(userId, role as UserRole);

    // rotate refresh token in redis
    await this._tokenService.storeRefreshToken(userId, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken, };
  }
}