import { inject, injectable } from "tsyringe";
import { IChangePasswordUseCase } from "../../../ports/user/profile-settings/IChangePasswordUseCase";
import { IUserRepository } from "../../../../domain/repositories/IUserRepository";
import { ChangePasswordReqDTO, ChangePasswordResponseDTO } from "../../../dtos/user/ChangePasswordDTO";
import { ErrorMessages } from "../../../../shared/constants/ErrorMessages";
import { IHashService } from "../../../../domain/services/IHashService";

@injectable()
export class ChangePasswordUseCase implements IChangePasswordUseCase {
    constructor(
        @inject("UserRepository") private readonly _userRepository: IUserRepository,
        @inject("HashService") private readonly _hashService: IHashService
    ) { }

    async execute(dto: ChangePasswordReqDTO): Promise<ChangePasswordResponseDTO> {

        const user = await this._userRepository.findById(dto.userId)

        if (!user) {
            throw new Error(ErrorMessages.USER.NOT_FOUND)
        }

        const isValid = await this._hashService.compare(dto.currentPassword, user.password!)

        if (!isValid) {
            throw new Error(ErrorMessages.USER.WRON_CURRENT_PASS)
        }

        // hash service : check password
        const hashNewPassword = await this._hashService.hash(dto.newPassword)

        const result = await this._userRepository.saveNewPassword(dto.userId, hashNewPassword)

        return {
            isChanged: result
        }
    }
}