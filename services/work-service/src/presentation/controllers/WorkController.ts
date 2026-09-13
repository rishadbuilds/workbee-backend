import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "tsyringe";

import { HttpStatus } from "../../shared/enums/HttpStatus";
import { ResponseHelper } from "../../shared/helpers/ResponseHelper";
import { ResponseMessage } from "../../shared/constants/ResponseMessages";
import { ENV } from "../../infrastructure/config/env";
import { ErrorMessages } from "../../shared/constants/ErrorMessages";

import { DeleteWorkDto, PostWorkDto, UpdateWorkDto } from "../../application/dtos/work/WorkDTO";
import { ApplyWorkerDto, WorkerApproveDto } from "../../application/dtos/worker/WorkerDTO";
import { GetAllWorksFilterDto } from "../../application/dtos/work/GetAllWorksFilterDto";

import { IWorkController } from "../ports/IWorkContoller";

/** usecase interfaces */
import { IApplyWorkerUseCase } from "../../application/ports/worker/IApplyWorkerUseCase";
import { IGetNewAppliersUseCase } from "../../application/ports/worker/IGetNewAppliersUseCase";
import { IWorkerApproveUseCase } from "../../application/ports/worker/IWorkerApproveUseCase";
import { IGetAllWorkersUseCase } from "../../application/ports/worker/IGetAllWorkersUseCase";
import { IPostWorkUseCase } from "../../application/ports/work/IPostWorkUseCase";
import { IGetAllWorksUseCase } from "../../application/ports/work/IGetAllWorksUseCase";
import { IBlockWorkerUseCase } from "../../application/ports/worker/IBlockWorkerUseCase";
import { IGetMyWorksUseCase } from "../../application/ports/user/IGetMyWorksUseCase";
import { IUpdateWorkUseCase } from "../../application/ports/user/IUpdateWorkUseCase";
import { IDeleteMyWorkUseCase } from "../../application/ports/user/IDeleteMyWorkUseCase";
import { IGetWorkerProfileUseCase } from "../../application/ports/worker/IGetWorkerProfileUseCase";
import { IGetWorkerProfileBatchUseCase } from "../../application/ports/isc/IGetWorkerProfilesBatchUseCase";
import { IGetWorkerAssignedWorksUseCase } from "../../application/ports/isc/IGetWorkerAssignedWorksUseCase";
import { IUpdateWorkerProfileImageUseCase } from "../../application/ports/worker/IUpdateWorkerProfileImageUseCase";
import { IGetWorkerProfileSettingsUseCase } from "../../application/ports/worker/IGetWorkerProfileSettingsUseCase";

/** service interfaces */
import { ICloudinaryService } from "../../domain/services/ICloudinaryService";
import { IGetWorkerDashboardStatsUseCase } from "../../application/ports/worker/IGetWorkerDashboardStatsUseCase";
import { IGetAdminWorkStatsUseCase } from "../../application/ports/admin/IGetAdminWorkStatsUseCase";
import { IUpdateWorkerProfileUseCase } from "../../application/ports/worker/IUpdateWorkerProfileUseCase";
import { UpdateWorkerProfileReqDTO } from "../../application/dtos/worker/UpdateWorkerProfileDTO";
import { IGetLiveWorksUseCase } from "../../application/ports/user/IGetLiveWorksUseCase";

@injectable()
export class WorkController implements IWorkController {
    constructor(
        @inject("ApplyWorkerUseCase") private readonly _applyWorkerUseCase: IApplyWorkerUseCase,
        @inject("GetNewAppliersUseCase") private readonly _getNewAppliersUseCase: IGetNewAppliersUseCase,
        @inject("WorkerApproveUseCase") private readonly _workerApproveUseCase: IWorkerApproveUseCase,
        @inject("GetAllWorkersUseCase") private readonly _getAllWorkersUseCase: IGetAllWorkersUseCase,
        @inject("PostWorkUseCase") private readonly _postWorkUseCase: IPostWorkUseCase,
        @inject("GetAllWorksUseCase") private readonly _getAllWorksUseCase: IGetAllWorksUseCase,
        @inject("BlockWorkerUseCase") private readonly _blockWorkerUseCase: IBlockWorkerUseCase,
        @inject("GetMyWorksUseCase") private readonly _getMyWorksUseCase: IGetMyWorksUseCase,
        @inject("UpdateWorkUseCase") private readonly _updateWorkUseCase: IUpdateWorkUseCase,
        @inject("DeleteMyWorkUseCase") private readonly _deleteMyWorkUseCase: IDeleteMyWorkUseCase,
        @inject("GetWorkerProfileUseCase") private readonly _getWorkerProfileUseCase: IGetWorkerProfileUseCase,
        @inject("GetWorkerProfilesBatchUseCase") private readonly _getWorkerProfilesBatchUseCase: IGetWorkerProfileBatchUseCase,
        @inject("GetWorkerAssignedWorksUseCase") private readonly _getWorkerAssignedWorksUseCase: IGetWorkerAssignedWorksUseCase,
        @inject("GetLiveWorksUseCase") private readonly _getLiveWorksUseCase: IGetLiveWorksUseCase,

        @inject("UpdateWorkerProfileImageUseCase") private readonly _updateWorkerProfileImageUseCase: IUpdateWorkerProfileImageUseCase,
        @inject("GetWorkerProfileSettingsUseCase") private readonly _getWorkerProfileSettingsUseCase: IGetWorkerProfileSettingsUseCase,
        @inject("GetWorkerDashboardStatsUseCase") private readonly _getWorkerDashboardStatsUseCase: IGetWorkerDashboardStatsUseCase,
        @inject("CloudinaryService") private readonly _cloudinaryService: ICloudinaryService,

        @inject("GetAdminWorkStatsUseCase") private readonly _getAdminWorkStatsUseCase: IGetAdminWorkStatsUseCase,
        @inject("UpdateWorkerProfileUseCase") private readonly _updateWorkerProfileUseCase: IUpdateWorkerProfileUseCase,

    ) { }

    async applyWorker(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: ApplyWorkerDto = req.body;
            const result = await this._applyWorkerUseCase.execute(dto);

            res
                .status(HttpStatus.OK)
                .json(ResponseHelper.success(result, ResponseMessage.WORKER.APPLIED));
        } catch (err) {
            next(err);
        }
    }

    async getNewAppliers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = (req.query.search as string) || "";
            const status = ((req.query.status as string) || "all") as 'all' | 'pending' | 'approved' | 'rejected';

            const result = await this._getNewAppliersUseCase.execute(page, limit, search, status);

            res.status(HttpStatus.OK).json(
                ResponseHelper.success({
                    workers: result.workers,
                    total: result.total,
                    page,
                    limit,
                    totalPages: Math.ceil(result.total / limit)
                },
                    ResponseMessage.WORKER.GET_ALL_APPLIERS
                ));
        } catch (err) {
            next(err);
        }
    }

    async approveWorker(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: WorkerApproveDto = {
                workerId: req.body.workerId,
                status: req.body.status,
                rejectionReason: req.body.rejectionReason
            };

            const result = await this._workerApproveUseCase.execute(dto);
            res
                .status(HttpStatus.OK)
                .json(ResponseHelper.success(result, ResponseMessage.WORK.WORK_STATUS_UPDATED));
        } catch (err) {
            next(err);
        }
    }

    async getWorkers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = (req.query.search as string) || "";
            const status = (req.query.status as string) || "all";

            const result = await this._getAllWorkersUseCase.execute(page, limit, search, status);

            res.status(HttpStatus.OK).json(
                ResponseHelper.success(
                    {
                        workers: result.workers,
                        total: result.total,
                        page,
                        limit,
                        totalPages: Math.ceil(result.total / limit)
                    },
                    "Get all workers"
                )
            );
        } catch (err) {
            next(err);
        }
    }

    async postWork(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dto: PostWorkDto = req.body;

            const result = await this._postWorkUseCase.execute(dto);

            res
                .status(HttpStatus.OK)
                .json(
                    ResponseHelper.success(
                        result,
                        ResponseMessage.WORK.WORK_BOOKED
                    )
                );
        } catch (err) {
            next(err);
        }
    }

    async getAllWorks(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {
                search = '',
                status = 'all',
                page = '1',
                limit = '10',
                latitude,
                longitude,
                maxDistance
            } = req.query;

            const filters: GetAllWorksFilterDto = {
                search: search as string,
                status: status as string,
                page: parseInt(page as string),
                limit: parseInt(limit as string)
            };

            if (latitude && longitude && maxDistance) {
                filters.latitude = parseFloat(latitude as string);
                filters.longitude = parseFloat(longitude as string);
                filters.maxDistance = parseFloat(maxDistance as string);
            }

            const result = await this._getAllWorksUseCase.execute(filters);

            res.status(HttpStatus.OK).json(
                ResponseHelper.success({
                    works: result.works,
                    pagination: {
                        total: result.total,
                        totalPages: result.totalPages,
                        currentPage: parseInt(page as string),
                        limit: parseInt(limit as string)
                    }
                }, "Successfully retrieved works"));
        } catch (err) {
            next(err);
        }
    }

    async blockWorker(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const workerId = req.params.id;
            if (typeof workerId !== 'string') {
                res.status(HttpStatus.BAD_REQUEST).json(ResponseHelper.error(ErrorMessages.WORKER.WRONG_WORKER_ID, HttpStatus.BAD_REQUEST))
                return
            }
            const result = await this._blockWorkerUseCase.execute(workerId);
            res.status(HttpStatus.OK).json(ResponseHelper.success(result, ResponseMessage.AUTH.BLOCKED_WORKER));
        } catch (err) {
            next(err);
        }
    }

    async getMyWorks(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.headers['x-user-id'] as string;
            if (!userId) {
                res.status(HttpStatus.UNAUTHORIZED).json(
                    ResponseHelper.error(ErrorMessages.AUTH.UNAUTHORIZED, HttpStatus.UNAUTHORIZED)
                );
                return;
            }

            const { page, limit, bucket } = req.query;

            type MyWorksParams = Parameters<IGetMyWorksUseCase["execute"]>[0];

            const result = await this._getMyWorksUseCase.execute({
                userId,
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                bucket: bucket ? (String(bucket) as MyWorksParams["bucket"]) : undefined,
            });

            res.status(HttpStatus.OK).json(
                ResponseHelper.success(result, ResponseMessage.WORK.RETRIEVED_WORKS)
            );
        } catch (err) {
            next(err);
        }
    }

    async getLiveWorks(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.headers['x-user-id'] as string;
            if (!userId) {
                res.status(HttpStatus.UNAUTHORIZED).json(
                    ResponseHelper.error(ErrorMessages.AUTH.UNAUTHORIZED, HttpStatus.UNAUTHORIZED)
                );
                return;
            }

            const { page, limit, bucket } = req.query;

            const result = await this._getLiveWorksUseCase.execute({
                userId,
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                bucket: bucket ? (String(bucket) as 'active' | 'completed') : undefined,
            });

            res.status(HttpStatus.OK).json(
                ResponseHelper.success(result, ResponseMessage.WORK.RETRIEVED_WORKS)
            );
        } catch (err) {
            next(err);
        }
    }

    async updateWork(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const workId = req.params.workId;
            const userId = req.headers['x-user-id'] as string;
            const updateData = req.body;

            if (!userId) {
                res.status(HttpStatus.UNAUTHORIZED).json(
                    ResponseHelper.error(ErrorMessages.AUTH.UNAUTHORIZED, HttpStatus.UNAUTHORIZED)
                );
                return;
            }

            const dto: UpdateWorkDto = { workId, userId, ...updateData };

            const updatedWork = await this._updateWorkUseCase.execute(dto);

            res.status(HttpStatus.OK).json(ResponseHelper.success(updatedWork, ResponseMessage.WORK.WORK_UPDATED));
        } catch (err) {
            next(err);
        }
    }

    async deleteMyWork(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.headers["x-user-id"] as string;
            const { workId } = req.params;

            if (!userId) {
                res.status(HttpStatus.UNAUTHORIZED).json(
                    ResponseHelper.error(ErrorMessages.AUTH.UNAUTHORIZED, HttpStatus.UNAUTHORIZED)
                );
                return;
            }

            if (typeof workId !== "string") {
                res.status(HttpStatus.BAD_REQUEST).json(
                    ResponseHelper.error(ErrorMessages.WORK.WRONG_WORK_ID, HttpStatus.BAD_REQUEST)
                );
                return;
            }

            const dto: DeleteWorkDto = { workId, userId };

            const result = await this._deleteMyWorkUseCase.execute(dto);

            res.status(HttpStatus.OK).json(
                ResponseHelper.success(result, ResponseMessage.WORK.WORK_DELETED)
            );

        } catch (err) {
            next(err);
        }
    }


    async getWorkerProfileSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const workerId = req.headers["x-user-id"];

            if (!workerId || typeof workerId !== "string") {
                throw new Error(ErrorMessages.AUTH.UNAUTHORIZED);
            }

            const result = await this._getWorkerProfileSettingsUseCase.execute({ workerId });

            res
                .status(HttpStatus.OK)
                .json(ResponseHelper.success(result, ResponseMessage.WORKER.GET_WORKER_PROFILE, HttpStatus.OK));
        } catch (error) {
            next(error);
        }
    }

    async getWorkerProfileImageUploadSignature(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const workerId = req.headers["x-user-id"];

            if (!workerId || typeof workerId !== "string") {
                throw new Error(ErrorMessages.AUTH.UNAUTHORIZED);
            }

            const folder = `workbee/worker-profiles/${workerId}`;

            const { signature, timestamp } = this._cloudinaryService.generateUploadSignature({ folder, });

            const data = {
                signature,
                timestamp,
                apiKey: ENV.CLOUDINARY_API_KEY,
                cloudName: ENV.CLOUDINARY_CLOUD_NAME,
                folder,
            };

            res
                .status(HttpStatus.OK)
                .json(ResponseHelper.success(data, ResponseMessage.WORKER.UPLOAD_SIGN_GENERATED));

        } catch (error) {
            next(error);
        }
    }


    async updateWorkerProfileImage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const workerId = req.headers["x-user-id"];

            if (!workerId || typeof workerId !== "string") {
                throw new Error(ErrorMessages.AUTH.UNAUTHORIZED);
            }

            const { imageUrl, publicId } = req.body;

            const result = await this._updateWorkerProfileImageUseCase.execute({ workerId, imageUrl, publicId, });

            res
                .status(HttpStatus.OK)
                .json(ResponseHelper.success(result, ResponseMessage.WORKER.WORKER_PROFILE_IMAGE_UPDATED));

        } catch (error) {
            next(error);
        }
    }

    async updateWorkerProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.headers["x-user-id"];

            if (!userId || typeof userId !== "string") {
                throw new Error(ErrorMessages.AUTH.UNAUTHORIZED);
            }

            const { name, phone, location, bio } = req.body;

            const updateWorkerProfileData: UpdateWorkerProfileReqDTO = { userId, name, phone, location, bio, };

            const result = await this._updateWorkerProfileUseCase.execute(updateWorkerProfileData);

            res.status(HttpStatus.OK).json(ResponseHelper.success(result, ResponseMessage.WORKER.WORKER_PROFILE_UPDATED));
        } catch (error) {
            next(error);
        }
    }

    async getWorkerDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const workerId = req.headers['x-user-id'] as string;

            if (!workerId) {
                res.status(HttpStatus.UNAUTHORIZED).json(
                    ResponseHelper.error(ErrorMessages.AUTH.UNAUTHORIZED, HttpStatus.UNAUTHORIZED)
                );
                return;
            }

            const result = await this._getWorkerDashboardStatsUseCase.execute(workerId);
            res.status(HttpStatus.OK).json(ResponseHelper.success(result, ResponseMessage.GENERAL.SUCCESS));
        } catch (err) {
            next(err);
        }
    }

    async getAdminWorkStats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this._getAdminWorkStatsUseCase.execute();
            res.status(HttpStatus.OK).json(ResponseHelper.success(result, ResponseMessage.GENERAL.SUCCESS));
        } catch (err) {
            next(err);
        }
    }

    /** ==========================================================
     * inter ser comm with chat
     * ===========================================================
     */

    async getWorkerProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { workerId } = req.params;
            if (typeof workerId !== 'string') {
                res.status(HttpStatus.BAD_REQUEST).json(ResponseHelper.error(ErrorMessages.WORKER.WRONG_WORKER_ID, HttpStatus.BAD_REQUEST))
                return
            }
            const profile = await this._getWorkerProfileUseCase.execute({ workerId });
            res.status(HttpStatus.OK).json(ResponseHelper.success(profile, ResponseMessage.WORKER.WORKER_PROFILE_RETRIEVED));
        } catch (error) {
            next(error)
        }
    }

    async getWorkerProfilesBatch(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { workerIds } = req.body;

            if (!Array.isArray(workerIds)) {
                res.status(HttpStatus.BAD_REQUEST).json(
                    ResponseHelper.error(ErrorMessages.WORKER.WORKER_ID_MUST_BE_ARRAY, HttpStatus.BAD_REQUEST)
                );
                return;
            }

            const profiles = await this._getWorkerProfilesBatchUseCase.execute({ workerIds });
            res.status(HttpStatus.OK).json(ResponseHelper.success(profiles, ResponseMessage.WORKER.WORKER_PROFILE_RETRIEVED_BATCH));
        } catch (error) {
            next(error)
        }
    }

    async getWorkerAssignedWorks(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const workerId = req.headers['x-user-id'] as string;

            if (!workerId) {
                res.status(HttpStatus.UNAUTHORIZED).json(
                    ResponseHelper.error(ErrorMessages.AUTH.UNAUTHORIZED, HttpStatus.UNAUTHORIZED)
                );
                return;
            }

            const { page, limit, bucket, startDate, endDate } = req.query;

            type AssignedWorksParams = Parameters<IGetWorkerAssignedWorksUseCase["execute"]>[0];

            const works = await this._getWorkerAssignedWorksUseCase.execute({
                workerId,
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                bucket: bucket ? (String(bucket) as AssignedWorksParams["bucket"]) : undefined,
                startDate: startDate ? String(startDate) : undefined,
                endDate: endDate ? String(endDate) : undefined,
            });

            res.status(HttpStatus.OK).json(ResponseHelper.success(works, ResponseMessage.GENERAL.SUCCESS, HttpStatus.OK));
        } catch (err) {
            next(err);
        }
    }

    async getWorkMediaUploadSignature(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.headers["x-user-id"];

            if (!userId || typeof userId !== "string") {
                throw new Error(ErrorMessages.AUTH.UNAUTHORIZED);
            }

            // temp folder keyed by user + timestamp — media (images/videos/voice notes)
            // gets permanently associated with the work record once postWork saves the url/publicId
            const folder = `workbee/work-media/${userId}`;

            const { signature, timestamp } = this._cloudinaryService.generateUploadSignature({ folder });

            const data = {
                signature,
                timestamp,
                apiKey: ENV.CLOUDINARY_API_KEY,
                cloudName: ENV.CLOUDINARY_CLOUD_NAME,
                folder,
            };

            res.status(HttpStatus.OK).json(
                ResponseHelper.success(data, ResponseMessage.WORK.UPLOAD_SIGN_GENERATED ?? "Upload signature generated")
            );
        } catch (error) {
            next(error);
        }
    }


}