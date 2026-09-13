import { inject, injectable } from "tsyringe";
import { IWorkRepository } from "../../../domain/repositories/IWorkRepository";
import { IGetWorkerAssignedWorksUseCase } from "../../ports/isc/IGetWorkerAssignedWorksUseCase";
import {GetWorkerAssignedWorksDto,GetWorkerAssignedWorksResponseDto,WorkItemDto,} from "../../dtos/worker/GetWorkerAssignedWorks.dtos";

const DEFAULT_LIMIT = 6;

@injectable()
export class GetWorkerAssignedWorksUseCase implements IGetWorkerAssignedWorksUseCase {
  constructor(
    @inject("WorkRepository") private readonly _workRepository: IWorkRepository
  ) {}

  async execute(dto: GetWorkerAssignedWorksDto): Promise<GetWorkerAssignedWorksResponseDto> {
    const { workerId } = dto;
    const page = dto.page && dto.page > 0 ? dto.page : 1;
    const limit = dto.limit && dto.limit > 0 ? dto.limit : DEFAULT_LIMIT;
    const bucket = dto.bucket ?? 'all';

    const [{ works, total }, counts] = await Promise.all([
      this._workRepository.findByWorkerId(workerId, {
        page,
        limit,
        bucket,
        startDate: dto.startDate,
        endDate: dto.endDate,
      }),
      this._workRepository.countWorkerBuckets(workerId),
    ]);

    const workDtos: WorkItemDto[] = works.map((work) => ({
      id: work.id!,
      userId: work.userId,
      workTitle: work.workTitle,
      workCategory: work.workCategory,
      workType: work.workType,
      status: work.status,
      progress: work.progress,
      budget: work.budget ? Number(work.budget) : undefined,
      startDate: work.startDate,
      endDate: work.endDate,
      description: work.description,
      manualAddress: work.manualAddress,
      createdAt: work.createdAt!,
    }));

    return {
      works: workDtos,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      counts,
    };
  }
}