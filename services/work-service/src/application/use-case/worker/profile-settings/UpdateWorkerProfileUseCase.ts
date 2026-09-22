import { inject, injectable } from "tsyringe";
import { IWorkerRepository } from "../../../../domain/repositories/IWorkerRepository";
import { UpdateWorkerProfileReqDTO, WorkerProfileResponseDTO } from "../../../dtos/worker/UpdateWorkerProfileDTO";
import { IUpdateWorkerProfileUseCase } from "../../../ports/worker/IUpdateWorkerProfileUseCase";
import { WorkerMapper } from "../../../mappers/WorkerMapper";

@injectable()
export class UpdateWorkerProfileUseCase implements IUpdateWorkerProfileUseCase {
    constructor(
        @inject("WorkerRepository") private readonly _workerRepository: IWorkerRepository
    ) { }

    async execute(data: UpdateWorkerProfileReqDTO): Promise<WorkerProfileResponseDTO | null> {

        const worker = await this._workerRepository.findById(data.userId);

        if (!worker) {
            throw new Error("Worker profile not found");
        }

        const updatedWorker = await this._workerRepository.updateWorkerProfile(data.userId, {
                name: data.name.trim(),
                phone: data.phone.trim(),
                address: data.address,
                bio: data.bio.trim(),
            });

        if (!updatedWorker) {
            return null;
        }

        return WorkerMapper.toProfileResponse(updatedWorker);
    }
}