import { inject, injectable } from "tsyringe";
import { IBlockWorkerUseCase } from "../../ports/worker/IBlockWorkerUseCase";
import { IWorkerRepository } from "../../../domain/repositories/IWorkerRepository";
import { Worker } from "../../../domain/entities/Worker";
import { ErrorMessages } from "../../../shared/constants/ErrorMessages";
import { IWorkerEventPublisher } from "../../../domain/message-bus/IWorkerEventPublisher";

/** block worker usecase */

@injectable()
export class BlockWorkerUseCase implements IBlockWorkerUseCase {
  constructor(
    @inject("WorkerRepository") private readonly _workerRepository: IWorkerRepository,
    @inject("WorkerEventPublisher") private readonly _eventPublisher: IWorkerEventPublisher
  ) {}

  async execute(workerId: string): Promise<Worker> {
    const worker = await this._workerRepository.findById(workerId);
    if (!worker) throw new Error(ErrorMessages.WORKER.WORKER_NOT_FOUND_TO_BLOCK);

    worker.isBlocked = !worker.isBlocked;
    const updatedWorker = await this._workerRepository.save(worker);

    // publish event - auth service will delete the refresh token
    await this._eventPublisher.publishWorkerBlocked({workerId: worker.id!,isBlocked: updatedWorker.isBlocked! });

    return updatedWorker;
  }
}
