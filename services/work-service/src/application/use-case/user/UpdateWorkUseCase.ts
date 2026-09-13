import { inject, injectable } from "tsyringe";
import axios from "axios";
import { IUpdateWorkUseCase } from "../../ports/user/IUpdateWorkUseCase";
import { IWorkRepository } from "../../../domain/repositories/IWorkRepository";
import { UpdateWorkDto, WorkResponseDto } from "../../dtos/work/WorkDTO";
import { WorkMapper } from "../../mappers/WorkMapper";
import { ErrorMessages } from "../../../shared/constants/ErrorMessages";
import { logger } from "../../../infrastructure/logger/logger";
import { IWorkProgressEventPublisher } from "../../../domain/message-bus/IWorkProgressEventPublisher";

@injectable()
export class UpdateWorkUseCase implements IUpdateWorkUseCase {
  constructor(
    @inject("WorkRepository") private readonly _workRepository: IWorkRepository,
    @inject("WorkProgressEventPublisher") private readonly _workProgressEventPublisher: IWorkProgressEventPublisher,
  ) { }

  async execute(dto: UpdateWorkDto): Promise<WorkResponseDto> {
    const existingWork = await this._workRepository.findById(dto.workId);
    if (!existingWork) throw new Error(ErrorMessages.WORK.WORK_NOT_FOUND);

    const isWorkerProgressUpdate = dto.progress !== undefined || dto.status === "in-progress" || dto.status === "completed";

    if (isWorkerProgressUpdate) {
      if (String(existingWork.workerId) !== String(dto.userId)) {
        throw new Error(ErrorMessages.WORK.DONT_HAVE_PERMISSION_TO_UPDATE);
      }
    } else {
      if (String(existingWork.userId) !== String(dto.userId)) {
        throw new Error(ErrorMessages.WORK.DONT_HAVE_PERMISSION_TO_UPDATE);
      }
    }

    // dto.userId is the ACTOR calling this endpoint (client or worker),
    // used only for the permission check above. It must never be written
    // to the Work document — that field is the work's original client owner.
    
    const { workId, userId, ...updateData } = dto;
    const updatedWork = await this._workRepository.update(workId, updateData);
    if (!updatedWork) throw new Error(ErrorMessages.WORK.FAILED_TO_UPDATE_WORK);

    if (dto.progress !== undefined) {
      await this._workProgressEventPublisher.publishWorkProgressChanged({
        workId,
        userId: existingWork.userId,
        workerId: existingWork.workerId!,
        progress: dto.progress,
      });
    }

    if (dto.progress === "completed" || dto.status === "completed") {
      this._notifyPaymentService(workId).catch((err) => {
        logger.error("[UpdateWorkUseCase] Failed to notify payment service:", err.message);
      });
    }

    return WorkMapper.toResponseDto(updatedWork);
  }

  private async _notifyPaymentService(workId: string): Promise<void> {
    const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL;
    if (!paymentServiceUrl) {
      logger.warn("[UpdateWorkUseCase] PAYMENT_SERVICE_URL not set — skipping payment notification");
      return;
    }

    await axios.post(`${paymentServiceUrl}/payment/work-completed`, { workId }, { timeout: 5000 });
    logger.info(`UpdateWorkUseCase - Notified payment service for completed work ${workId}`);
  }
}