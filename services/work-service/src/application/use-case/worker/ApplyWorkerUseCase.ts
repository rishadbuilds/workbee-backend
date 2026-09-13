import { inject, injectable } from "tsyringe";
import { ResponseMessage } from "../../../shared/constants/ResponseMessages";

import { ApplyWorkerDto, WorkerResponseDto } from "../../dtos/worker/WorkerDTO";

import { WorkerMapper } from "../../mappers/WorkerMapper";

import { IWorkerRepository } from "../../../domain/repositories/IWorkerRepository";
import { IHashService } from "../../../domain/services/IHashService";
import { IApplyWorkerUseCase } from "../../ports/worker/IApplyWorkerUseCase";

@injectable()
export class ApplyWorkerUseCase implements IApplyWorkerUseCase{
    constructor(
        @inject("WorkerRepository") private readonly _workerRepository: IWorkerRepository,
        @inject("HashService") private readonly _hashService: IHashService
    ) {}

    async execute(dto: ApplyWorkerDto): Promise<WorkerResponseDto> {
    const existing = await this._workerRepository.findByEmail(dto.email);

    if (existing) {
        if (existing.status === "pending" || existing.status === "approved") {
            throw new Error(ResponseMessage.AUTH.ALREADY_EXISTS);
        }

        if (existing.status === "rejected") {
            if (existing.isBlocked || existing.canReapply === false) {
                throw new Error(ResponseMessage.AUTH.REAPPLY_NOT_ALLOWED);
            }

            const worker = WorkerMapper.toEntity(dto);
            worker.password = await this._hashService.hash(worker.password);

            // update the same document instead of inserting a new one
            const updatedWorker = await this._workerRepository.reapply(existing.id, worker);
            return WorkerMapper.toResponseDto(updatedWorker);
        }
    }

    const worker = WorkerMapper.toEntity(dto);
    worker.password = await this._hashService.hash(worker.password);
    const savedWorker = await this._workerRepository.save(worker);
    return WorkerMapper.toResponseDto(savedWorker);
}
}