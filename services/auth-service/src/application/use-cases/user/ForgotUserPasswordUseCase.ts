import { injectable, inject } from "tsyringe";
import { ErrorMessages } from "../../../shared/constants/ErrorMessages";
import { ResponseMessage } from "../../../shared/constants/ResponseMessages";

import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { IEmailService } from "../../../domain/services/IEmailService";
import { ITokenService } from "../../../domain/services/ITokenService";
import { IForgotPasswordUseCase } from "../../ports/user/IForgotPasswordUseCase";
import { ENV } from "../../../infrastructure/config/env";

@injectable()
export class ForgotPasswordUseCase implements IForgotPasswordUseCase{
    constructor(
        @inject("UserRepository") private readonly _userRepository:IUserRepository,
        @inject("TokenService") private readonly _tokenService:ITokenService,
        @inject("EmailService") private readonly _emailService:IEmailService
    ){}

    async execute(email:string){
        const user = await this._userRepository.findByEmail(email)
        if(!user) throw new Error(ErrorMessages.USER.NOT_FOUND)
        // console.log('forgot pass usecase get user')
        const resetToken = this._tokenService.generateAccess(user.id!)

        const resetLink = `${ENV.CLIENT_URL}/reset-password/${resetToken}`

        await this._emailService.sendResentPasswordLink(email, resetLink)

        return { message: ResponseMessage.USER.SENT_RESET_LINK}
    }
}
