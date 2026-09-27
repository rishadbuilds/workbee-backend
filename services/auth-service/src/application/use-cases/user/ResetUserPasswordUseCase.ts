import { inject, injectable } from "tsyringe";
import { ErrorMessages } from "../../../shared/constants/ErrorMessages";
import { ResponseMessage } from "../../../shared/constants/ResponseMessages";

import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { ITokenService } from "../../../domain/services/ITokenService";
import { IHashService } from "../../../domain/services/IHashService";

import { IResetPasswordUseCase } from "../../ports/user/IResetPasswordUseCase";


@injectable()
export class ResetPasswordUseCase implements IResetPasswordUseCase{
    constructor(
        @inject("UserRepository") private readonly _userRepository:IUserRepository,
        @inject("TokenService") private readonly _tokenService:ITokenService,
        @inject("HashService") private readonly _hashService:IHashService
    ){}

    async execute(token:string, password:string){
        const payload = this._tokenService.verifyAccess(token)
        const user = await this._userRepository.findById(payload.userId)
        if(!user) throw new Error(ErrorMessages.USER.NOT_FOUND)
        
        const hashed = await this._hashService.hash(password)
        // console.log('hased pas',hashed)
        user.password = hashed

        await this._userRepository.save(user)
        return { message:ResponseMessage.USER.PASSOWORD_UPDATED}
    }
}