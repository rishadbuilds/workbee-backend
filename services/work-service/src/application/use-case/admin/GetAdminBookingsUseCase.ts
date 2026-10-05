import { inject, injectable } from "tsyringe";
import { IWorkRepository } from "../../../domain/repositories/IWorkRepository";
import { IGetAdminBookingsUseCase } from "../../ports/admin/IGetAdminBookingsUseCase";
import {
  AdminBookingItemDto,
  GetAdminBookingsDto,
  GetAdminBookingsResponseDto,
} from "../../dtos/admin/GetAdminBookingsDTOs";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_STATUS = ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'];

@injectable()
export class GetAdminBookingsUseCase implements IGetAdminBookingsUseCase {
  constructor(
    @inject("WorkRepository") private readonly _workRepository: IWorkRepository
  ) { }

  async execute(dto: GetAdminBookingsDto): Promise<GetAdminBookingsResponseDto> {
    const page = dto.page && dto.page > 0 ? dto.page : 1;
    const limit = dto.limit && dto.limit > 0 ? Math.min(dto.limit, MAX_LIMIT) : DEFAULT_LIMIT;

    // swap Error for your AppError / validation error class
    if (dto.status && !VALID_STATUS.includes(dto.status)) throw new Error("Invalid status filter");
    if (dto.fromDate && !DATE_RE.test(dto.fromDate)) throw new Error("Invalid fromDate");
    if (dto.toDate && !DATE_RE.test(dto.toDate)) throw new Error("Invalid toDate");
    if (dto.fromDate && dto.toDate && dto.fromDate > dto.toDate) {
      throw new Error("fromDate cannot be after toDate");
    }

    const { works, total } = await this._workRepository.findAllForAdmin({
      page,
      limit,
      status: dto.status,
      fromDate: dto.fromDate,
      toDate: dto.toDate,
    });

    const items: AdminBookingItemDto[] = works.map((w) => ({
      id: w.id!,
      userId: w.userId,
      workerId: w.workerId ?? undefined,
      workTitle: w.workTitle,
      workCategory: w.workCategory,
      workType: w.workType,
      date: w.date,
      startDate: w.startDate,
      endDate: w.endDate,
      time: w.time,
      duration: w.duration,
      budget: w.budget,
      description: w.description,
      contactNumber: w.contactNumber,
      manualAddress: w.manualAddress,
      landmark: w.landmark,
      currentLocation: w.currentLocation,
      petrolAllowance: w.petrolAllowance,
      extraRequirements: w.extraRequirements,
      anythingElse: w.anythingElse,
      images: w.images ?? [],
      videos: w.videos ?? [],
      voiceFile: w.voiceFile ?? null,
      status: w.status,
      progress: w.progress ?? null,
      createdAt: w.createdAt!,
      updatedAt: w.updatedAt,
    }));

    return {
      works: items,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }
}