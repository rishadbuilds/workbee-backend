import { injectable, inject } from "tsyringe";
import { ErrorMessages } from "../../../shared/constants/ErrorMessages";

import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { IOtpRepository } from "../../../domain/repositories/IOtpRepository";
import { IOtpService } from "../../../domain/services/IOtpService";
import { IEmailService } from "../../../domain/services/IEmailService";
import { ResendOtpRequestDTO, ResendOtpResponseDTO } from "../../dtos/user/ResendOtpDTO";
import { IResendOtpUseCase } from "../../ports/user/IResendOtpUseCase";
import { ResponseMessage } from "../../../shared/constants/ResponseMessages";

@injectable()
export class ResendOtpUseCase implements IResendOtpUseCase {
    constructor(
        @inject("UserRepository") private readonly _userRepository: IUserRepository,
        @inject("OtpRepository") private readonly _otpRepository: IOtpRepository,
        @inject("OtpService") private readonly _otpService: IOtpService,
        @inject("EmailService") private readonly _emailService: IEmailService
    ) { }

    async execute(data: ResendOtpRequestDTO): Promise<ResendOtpResponseDTO> {
        const { userId } = data;

        const user = await this._userRepository.findById(userId);
        if (!user) throw new Error(ErrorMessages.USER.NOT_FOUND);

        if (user.isVerified) throw new Error(ErrorMessages.USER.ALREADY_VERIFIED);

        // delete existing otp
        await this._otpRepository.deleteByUserId(userId);

        // gen new otp
        const otp = this._otpService.generateOtp().toString();
        console.log("new otp", otp);

        const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

        await this._otpRepository.save({ userId, otp, expiresAt });

        // send otp
        await this._emailService.sendOtp(user.email, otp);
        return { success: true, message: ResponseMessage.OTP.OTP_RESENT };
    }
}
