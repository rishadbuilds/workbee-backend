import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { HttpStatus } from "../../../shared/enums/HttpStatus";
import { ResponseHelper } from "../../../shared/helpers/responseHelper";
import { ResponseMessage } from "../../../shared/constants/ResponseMessages";
import { ErrorMessages } from "../../../shared/constants/ErrorMessages";
import { ENV } from "../../../infrastructure/config/env";

import { IUserController } from "../../ports/IUserContoller";

// dtos
import { RegisterUserRequestDTO } from "../../../application/dtos/user/RegisterUserDTO";
import { LoginUserRequestDTO } from "../../../application/dtos/user/LoginUserDTO";
import { VerifyOtpRequestDTO } from "../../../application/dtos/user/VerifyOtpDTO";
import { GoogleLoginRequestDTO } from "../../../application/dtos/user/GoogleLoginDTO";
import { ResendOtpRequestDTO } from "../../../application/dtos/user/ResendOtpDTO";
import { RefreshTokenRequestDTO } from "../../../application/dtos/user/RefreshTokenDTO";
import { UserProfileSettingsRequestDto } from "../../../application/dtos/user/UserProfileSettingsDto";
import { ChangePasswordReqDTO } from "../../../application/dtos/user/ChangePasswordDTO";
import { UpdateProfileImageReqDTO } from "../../../application/dtos/user/UserProfileImageUploadDTO";

// usecases
import { IRegisterUserUseCase } from "../../../application/ports/user/IRegisterUserUseCase";
import { ILoginUserUseCase } from "../../../application/ports/user/ILoginUserUseCase";
import { IVerifyOtpUseCase } from "../../../application/ports/user/IVerifyOtpUseCase";
import { IVerifyUserUseCase } from "../../../application/ports/user/IVerifyUserUseCase";
import { IGoogleLoginUserUseCase } from "../../../application/ports/user/IGoogleLoginUserUseCase";
import { IForgotPasswordUseCase } from "../../../application/ports/user/IForgotPasswordUseCase";
import { IResetPasswordUseCase } from "../../../application/ports/user/IResetPasswordUseCase";
import { IResendOtpUseCase } from "../../../application/ports/user/IResendOtpUseCase";
import { IRefreshTokenUseCase } from "../../../application/ports/user/IRefreshTokenUseCase";
import { ILogoutUserUseCase } from "../../../application/ports/user/ILogoutUserUseCase";
import { IGetUserProfileUseCase } from "../../../application/ports/isc/IGetUserProfileUseCase";
import { IGetUserProfilesBatchUseCase } from "../../../application/ports/isc/IGetUserProfilesBatchUseCase";
import { IGetUserProfileSettingsUseCase } from "../../../application/ports/user/profile-settings/IGetUserProfileSettingsUseCase";
import { IChangePasswordUseCase } from "../../../application/ports/user/profile-settings/IChangePasswordUseCase";

// services
import { ICloudinaryService } from "../../../domain/services/ICloudinaryService";
import { IUpdateProfileImageUseCase } from "../../../application/ports/user/profile-settings/IUpdateProfileImageUseCase";
import { UpdateUserProfileRequestDTO } from "../../../application/dtos/user/UpdateUserProfileDTO";
import { IUpdateUserProfileUseCase } from "../../../application/ports/user/profile-settings/IUpdateUserProfileUseCase";

/** 
 * user controller 
 * 
 */

@injectable()
export class UserController implements IUserController {
  constructor(
    @inject("RegisterUserUseCase") private readonly _registerUserUseCase: IRegisterUserUseCase,
    @inject("LoginUserUseCase") private readonly _loginUserUseCase: ILoginUserUseCase,
    @inject("VerifyOtpUseCase") private readonly _verifyOtpUseCase: IVerifyOtpUseCase,
    @inject("ResendOtpUseCase") private readonly _resendOtpUseCase: IResendOtpUseCase,
    @inject("VerifyUserUseCase") private readonly _verifyUserUseCase: IVerifyUserUseCase,
    @inject("GoogleLoginUserUseCase") private readonly _googleLoginUserUseCase: IGoogleLoginUserUseCase,
    @inject("ForgotPasswordUseCase") private readonly _forgotPasswordUseCase: IForgotPasswordUseCase,
    @inject("ResetPasswordUseCase") private readonly _resetPasswordUseCase: IResetPasswordUseCase,
    @inject("RefreshTokenUseCase") private readonly _refreshTokenUseCase: IRefreshTokenUseCase,
    @inject("LogoutUserUseCase") private readonly _logoutUserUseCase: ILogoutUserUseCase,
    @inject("GetUserProfileUseCase") private readonly _getUserProfileUseCase: IGetUserProfileUseCase,
    @inject("GetUserProfilesBatchUseCase") private readonly _getUserProfilesBatchUseCase: IGetUserProfilesBatchUseCase,
    @inject("GetUserProfileSettingsUseCase") private readonly _getUserProfileSettingsUseCase: IGetUserProfileSettingsUseCase,
    @inject("ChangePasswordUseCase") private readonly _changePasswordUseCase: IChangePasswordUseCase,
    @inject("CloudinaryService") private readonly _cloudinaryService: ICloudinaryService,
    @inject("UpdateProfileImageUseCase") private readonly _updateProfileImageUseCase: IUpdateProfileImageUseCase,
    @inject("UpdateUserProfileUseCase") private readonly _updateUserProfileUseCase: IUpdateUserProfileUseCase,
  ) { }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: RegisterUserRequestDTO = req.body;

      const result = await this._registerUserUseCase.execute(dto);

      res
        .status(HttpStatus.CREATED)
        .json(ResponseHelper.success(result, ResponseMessage.OTP.SENT, HttpStatus.CREATED));
    } catch (err) {
      next(err)
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: VerifyOtpRequestDTO = req.body;
      const result = await this._verifyOtpUseCase.execute(dto);

      res
        .status(HttpStatus.OK)
        .json(ResponseHelper.success(result, ResponseMessage.OTP.VERIFIED, HttpStatus.OK));
    } catch (err) {
      next(err)
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: ResendOtpRequestDTO = req.body;

      const result = await this._resendOtpUseCase.execute(dto);

      res
        .status(HttpStatus.OK)
        .json(ResponseHelper.success(result, ResponseMessage.OTP.OTP_RESENT, HttpStatus.OK));
    } catch (err) {
      next(err)
    }
  }



  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: LoginUserRequestDTO = req.body;

      const result = await this._loginUserUseCase.execute(dto);

      res
        .status(HttpStatus.OK)
        .json(ResponseHelper.success(result, ResponseMessage.USER.LOGINED_SUCCESFULLY, HttpStatus.OK));
    } catch (err) {
      next(err)
    }
  }

  async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this._verifyUserUseCase.execute(req.headers.authorization);

      res
        .status(HttpStatus.OK)
        .json(ResponseHelper.success(user, ResponseMessage.USER.VERFIFIED, HttpStatus.OK));
    } catch (err) {
      next(err)
    }
  }

  async googleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: GoogleLoginRequestDTO = req.body;
      const result = await this._googleLoginUserUseCase.execute(dto);

      res
        .status(HttpStatus.OK)
        .json(ResponseHelper.success(result, ResponseMessage.USER.LOGINED_SUCCESFULLY, HttpStatus.OK));
    } catch (err) {
      next(err)
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // console.log('hited contoller forgot passs')
      const { email } = req.body;

      const result = await this._forgotPasswordUseCase.execute(email)
      // console.log('rrrrrrr', result)
      res
        .status(HttpStatus.OK)
        .json(ResponseHelper.success({ result }, ResponseMessage.USER.SENT_RESET_LINK, HttpStatus.OK))
    } catch (error) {
      next(error)
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log("bodycontets", req.body)
      const { token } = req.params
      const { password } = req.body
      // console.log(password)
      // console.log('passssss', req.body.passoword)
      if (typeof token !== 'string') {
        res.status(HttpStatus.BAD_REQUEST).json(ResponseHelper.error(ErrorMessages.AUTH.INVALID_TOKEN, HttpStatus.BAD_REQUEST));
        return;
      }

      const result = await this._resetPasswordUseCase.execute(token, password)
      res
        .status(HttpStatus.OK)
        .json(ResponseHelper.success({ result }, ResponseMessage.USER.PASSOWORD_UPDATED, HttpStatus.OK))
    } catch (error) {
      next(error)
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: RefreshTokenRequestDTO = req.body;

      if (!dto.refreshToken) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json(ResponseHelper.error(ResponseMessage.TOKEN.REFRESH_TOKEN_IS_REQUIRED, HttpStatus.BAD_REQUEST));
        return;
      }

      const result = await this._refreshTokenUseCase.execute(dto);

      res
        .status(HttpStatus.OK)
        .json(ResponseHelper.success(result, ResponseMessage.TOKEN.TOKEN_REFRESHED, HttpStatus.OK));
    } catch (error) {
      next(error);
    }
  }

  async userLogout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json(ResponseHelper.error(ResponseMessage.AUTH.USER_NOT_AUTHENTICATED, HttpStatus.UNAUTHORIZED));
        return;
      }

      await this._logoutUserUseCase.execute(userId);

      res
        .status(HttpStatus.OK)
        .json(ResponseHelper.success(null, ResponseMessage.GENERAL.LOGED_OUT, HttpStatus.OK));
    } catch (error) {
      next(error);
    }
  }

  async getUserProfileSettings(req: Request<{ userId: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.headers['x-user-id']
      if (!userId || typeof userId !== "string") {
        throw new Error(ErrorMessages.AUTH.UNAUTHORIZED);
      }
      const dto: UserProfileSettingsRequestDto = { userId }
      const resp = await this._getUserProfileSettingsUseCase.execute(dto)
      res
        .status(HttpStatus.OK)
        .json(ResponseHelper.success(resp, ResponseMessage.USER.GET_USER_PROFILE_DETAILS, HttpStatus.OK))
    } catch (error) {
      next(error)
    }
  }

  async chageUserPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.headers["x-user-id"]
      if (!userId || typeof userId !== "string") {
        throw new Error(ErrorMessages.AUTH.UNAUTHORIZED);
      }
      const { newPassword, currentPassword } = req.body
      const dto: ChangePasswordReqDTO = {
        userId,
        newPassword: newPassword,
        currentPassword: currentPassword
      }
      const resp = await this._changePasswordUseCase.execute(dto)
      res
        .status(HttpStatus.OK)
        .json(ResponseHelper.success(resp, ResponseMessage.USER.CHANGE_PASS_SUCCESSFULLY, HttpStatus.OK))
    } catch (error) {
      next(error)
    }
  }

  /**
   * Profile Image Upload Signed URL Cloudinary
   */

  async getProfileImageUploadSignature(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

      const userId = req.headers["x-user-id"];

      if (!userId || typeof userId !== "string") {
        throw new Error(ErrorMessages.AUTH.UNAUTHORIZED);
      }

      const folder = `workbee/profiles/${userId}`
      const { signature, timestamp } = this._cloudinaryService.generateUploadSignature({ folder })

      const data = {
        signature,
        timestamp,
        apiKey: ENV.CLOUDINARY_API_KEY,
        cloudeName: ENV.CLOUDINARY_CLOUD_NAME,
        folder
      }

      res
        .status(HttpStatus.OK)
        .json(ResponseHelper.success(data, ResponseMessage.USER.GET_UPLOAD_SIGNATURE))

    } catch (error) {
      next(error)
    }
  }

  async updateProfileImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.headers["x-user-id"];

      if (!userId || typeof userId !== "string") {
        throw new Error(ErrorMessages.AUTH.UNAUTHORIZED);
      }

      const { imageUrl, publicId } = req.body;

      const dto: UpdateProfileImageReqDTO = {
        userId,
        imageUrl,
        publicId
      };

      const result = await this._updateProfileImageUseCase.execute(dto);

      res
        .status(HttpStatus.OK)
        .json(ResponseHelper.success(result, ResponseMessage.USER.PROFILE_IMAGE_UPDATED))

    } catch (error) {
      next(error);
    }
  }

  async updateUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {

      const userId = req.headers["x-user-id"];

      if (!userId || typeof userId !== "string") {
        throw new Error(ErrorMessages.AUTH.UNAUTHORIZED);
      }

      const { name, phone, location, bio } = req.body;
      const dto: UpdateUserProfileRequestDTO = { userId, name, phone, location, bio, };
      const result = await this._updateUserProfileUseCase.execute(dto);

      res.status(HttpStatus.OK).json(ResponseHelper.success(result, ResponseMessage.USER.PROFILE_UPDATED, HttpStatus.OK));

    } catch (error) {
      next(error);
    }
  }


  // ------- 
  /**
   * chat inter service communication 
   * 
   * 
   */

  async getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      if (typeof userId !== 'string') {
        res.status(HttpStatus.BAD_REQUEST).json(ResponseHelper.error(ErrorMessages.AUTH.INVALID_USER_ID, HttpStatus.BAD_REQUEST));
        return;
      }
      const profile = await this._getUserProfileUseCase.execute(userId);
      res.status(HttpStatus.OK).json(ResponseHelper.success(profile, ResponseMessage.USER.USER_PROFILE_RETRIEVED));
    } catch (error) {
      next(error);
    }
  }

  async getUserProfilesBatch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userIds } = req.body;

      if (!Array.isArray(userIds)) {
        res.status(HttpStatus.BAD_REQUEST).json(
          ResponseHelper.error(ErrorMessages.AUTH.USERIDS_MUST_BE_ARRAY, HttpStatus.BAD_REQUEST)
        );
        return;
      }

      const profiles = await this._getUserProfilesBatchUseCase.execute(userIds);
      res.status(HttpStatus.OK).json(ResponseHelper.success(profiles, ResponseMessage.USER.USER_PROFILES_ARE_RETRIEVED));
    } catch (error) {
      next(error);
    }
  }


}

