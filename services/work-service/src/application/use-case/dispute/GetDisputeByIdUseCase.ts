import { inject, injectable } from "tsyringe";
import { IDisputeRepository } from "../../../domain/repositories/IDisputeRepository";
import { IWorkerRepository } from "../../../domain/repositories/IWorkerRepository";
import { IWorkRepository } from "../../../domain/repositories/IWorkRepository";
import { DisputeDetailResponseDto, WorkerSummaryDto, UserSummaryDto } from "../../dtos/dispute/DisputeDTO";
import { DisputeMapper } from "../../mappers/DisputeMapper";
import { ErrorMessages } from "../../../shared/constants/ErrorMessages";
import { IGetDisputeByIdUseCase } from "../../ports/dispute/IGetDisputeByIdUseCase";
import { IGetUserProfileRpcClient } from "../../../domain/message-bus/IGetUserProfileRpcClient";

@injectable()
export class GetDisputeByIdUseCase implements IGetDisputeByIdUseCase {
  constructor(
    @inject("DisputeRepository") private readonly _disputeRepository: IDisputeRepository,
    @inject("WorkerRepository") private readonly _workerRepository: IWorkerRepository,
    @inject("WorkRepository") private readonly _workRepository: IWorkRepository,
    @inject("GetUserProfileRpcClient") private readonly _getUserProfileRpcClient: IGetUserProfileRpcClient
  ) {}

  async execute(disputeId: string): Promise<DisputeDetailResponseDto> {
    const dispute = await this._disputeRepository.findById(disputeId);
    if (!dispute) throw new Error(ErrorMessages.DISPUTE.DISPUTE_NOT_FOUND);

    const [worker, totalWorksCompleted, totalActionsAgainstWorker, totalActionsAgainstUser, userProfileRes] =
      await Promise.all([
        this._workerRepository.findById(dispute.workerId),
        this._workRepository.countCompletedByWorkerId(dispute.workerId),
        this._disputeRepository.countActionsForWorker(dispute.workerId),
        this._disputeRepository.countActionsForUser(dispute.userId),
        this._getUserProfileRpcClient.getUserProfile(dispute.userId),
      ]);

    const workerSummary: WorkerSummaryDto = {
      id: dispute.workerId,
      name: worker?.name || "Unknown Worker",
      email: worker?.email || "—",
      profileImage: worker?.workerProfileImage,
      isBlocked: !!worker?.isBlocked,
      isBlacklisted: !!worker?.isBlacklisted,
      totalWorksCompleted,
      totalActionsTaken: totalActionsAgainstWorker,
    };

    const userSummary: UserSummaryDto = {
      id: dispute.userId,
      name: userProfileRes.user?.name || "Unknown User",
      email: userProfileRes.user?.email || "—",
      profileImage: userProfileRes.user?.userProfileImage,
      isBlocked: !!userProfileRes.user?.isBlocked,
      isBlacklisted: !!userProfileRes.user?.isBlacklisted,
      totalActionsTaken: totalActionsAgainstUser,
    };

    return DisputeMapper.toDetailResponseDto(dispute, workerSummary, userSummary);
  }
}