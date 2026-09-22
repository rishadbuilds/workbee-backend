import { inject, injectable } from "tsyringe";
import { IWorkerRepository } from "../../../../domain/repositories/IWorkerRepository";
import { ErrorMessages } from "../../../../shared/constants/ErrorMessages";
import { IGetWorkerProfileSettingsUseCase } from "../../../ports/worker/IGetWorkerProfileSettingsUseCase";
import { GetWorkerProfileSettingsDto, WorkerProfileSettingsResponseDto } from "../../../dtos/worker/WorkerProfileDTO";


@injectable()
export class GetWorkerProfileSettingsUseCase implements IGetWorkerProfileSettingsUseCase {
    constructor(
        @inject("WorkerRepository") private readonly _workerRepository: IWorkerRepository
    ) { }

    async execute(dto: GetWorkerProfileSettingsDto): Promise<WorkerProfileSettingsResponseDto> {

        const worker = await this._workerRepository.findById(dto.workerId);
        if (!worker) throw new Error(ErrorMessages.WORKER.WORKER_NOT_FOUND);

        return {
            id: worker.id,
            name: worker.name,
            email: worker.email,
            phone: worker.phone,
            bio: worker.bio,
            address: worker.address,
            workTypes: worker.workTypes,
            preferredWorks: worker.preferredWorks,
            workerProfileImage: worker.workerProfileImage,
            workerProfileImagePublicId: worker.workerProfileImagePublicId,
            createdAt: worker.createdAt,
        };
    }
}