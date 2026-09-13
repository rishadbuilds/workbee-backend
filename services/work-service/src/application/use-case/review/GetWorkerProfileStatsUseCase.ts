import { inject, injectable } from "tsyringe";
import { IWorkerRepository } from "../../../domain/repositories/IWorkerRepository";
import { IWorkRepository } from "../../../domain/repositories/IWorkRepository";
import { IReviewRepository } from "../../../domain/repositories/IReviewRepository";
import { WorkerProfileStatsResponseDto } from "../../dtos/review/ReviewDTO";
import { ErrorMessages } from "../../../shared/constants/ErrorMessages";
import { IGetWorkerProfileStatsUseCase } from "../../ports/review/IGetWorkerProfileStatsUseCase";

@injectable()
export class GetWorkerProfileStatsUseCase implements IGetWorkerProfileStatsUseCase{
  constructor(
    @inject("WorkerRepository") private readonly _workerRepository: IWorkerRepository,
    @inject("WorkRepository") private readonly _workRepository: IWorkRepository,
    @inject("ReviewRepository") private readonly _reviewRepository: IReviewRepository
  ) {}

  async execute(workerId: string): Promise<WorkerProfileStatsResponseDto> {
    const worker = await this._workerRepository.findById(workerId);
    if (!worker) throw new Error(ErrorMessages.WORKER.WORKER_NOT_FOUND);

    const totalWorksCompleted = await this._workRepository.countCompletedByWorkerId(workerId);

    const { avgRating, totalReviews } = await this._reviewRepository.getWorkerStats(workerId);
    const { reviews } = await this._reviewRepository.findByWorkerId(workerId, 1, 20);

    return {
      id: worker.id,
      name: worker.name,
      workerProfileImage: worker.workerProfileImage,
      totalWorksCompleted,
      avgRating,
      totalReviews,
      testimonials: reviews
        .filter(r => r.testimonial && r.testimonial.trim().length > 0)
        .map(r => ({ rating: r.rating, testimonial: r.testimonial, createdAt: r.createdAt })),
    };
}
}