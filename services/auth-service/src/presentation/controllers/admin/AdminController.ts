import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { HttpStatus } from "../../../shared/enums/HttpStatus";
import { ResponseHelper } from "../../../shared/helpers/responseHelper";
import { ResponseMessage } from "../../../shared/constants/ResponseMessages";
import { ErrorMessages } from "../../../shared/constants/ErrorMessages";

//dtos
import { LoginAdminRequestDTO } from "../../../application/dtos/admin/LoginAdminDTO";

//usecase interfaces
import { ILoginAdminUseCase } from "../../../application/ports/admin/ILoginAdminUseCase";
import { IGetUsersUseCase } from "../../../application/ports/admin/IGetUsersUseCase";
import { IBlockUserUseCase } from "../../../application/ports/admin/IBlockUserUseCase";
import { IGetAdminUserStatsUseCase } from "../../../application/ports/admin/IGetAdminUserStatsUseCase";

// controller interface
import { IAdminContoller } from "../../ports/IAdminController";

/** 
 * admin controller 
 */

@injectable()
export class AdminController implements IAdminContoller {
    constructor(
        @inject("LoginAdminUseCase") private readonly _loginAdminUseCase: ILoginAdminUseCase,
        @inject("GetUsersUseCase") private readonly _getUsersUseCase: IGetUsersUseCase,
        @inject("BlockUserUseCase") private readonly _blockUserUseCase: IBlockUserUseCase,
        @inject("GetAdminUserStatsUseCase") private readonly _getAdminUserStatsUseCase: IGetAdminUserStatsUseCase,

    ) { }

    async adminLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // const {email, password} = req.body;
            const dto: LoginAdminRequestDTO = req.body
            const result = await this._loginAdminUseCase.execute(dto)
            res.status(HttpStatus.OK).json(ResponseHelper.success(result, ResponseMessage.ADMIN.LOGINED_SUCCESFULLY))
        } catch (err) {
            next(err)
        }
    }

    async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string);
            const search = (req.query.search as string);
            const status = (req.query.status as string);

            const result = await this._getUsersUseCase.execute(page, limit, search, status);

            res.status(HttpStatus.OK).json(ResponseHelper.success({
                users: result.users,
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit)
            }, ResponseMessage.ADMIN.GET_USERS));

        } catch (error) {
            next(error)
        }
    }

    async blockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id
            if (typeof userId !== "string") {
                throw new Error(ErrorMessages.USER.INVALID_USER_ID);
            }
            const result = await this._blockUserUseCase.execute(userId)
            res.status(HttpStatus.OK).json(ResponseHelper.success(result, ResponseMessage.ADMIN.ADMIN_BLOCKED_USER))
        } catch (error) {
            next(error)
        }
    }

    //admin dash stats
    async getUserStats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this._getAdminUserStatsUseCase.execute();
            res.status(HttpStatus.OK).json(ResponseHelper.success(result, ResponseMessage.ADMIN.GET_USER_STATS));
        } catch (error) {
            next(error);
        }
    }

}