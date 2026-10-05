import { inject, injectable } from "tsyringe";
import { IWorkRepository } from "../../../domain/repositories/IWorkRepository";
import { IGetAdminBookingsUseCase } from "../../ports/admin/IGetAdminBookingsUseCase";
import {
  GetAdminBookingsDto,
  GetAdminBookingsResponseDto,
} from "../../dtos/admin/GetAdminBookingsDTOs";
import { WorkMapper } from "../../mappers/WorkMapper";

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

    return {
      works: WorkMapper.toAdminBookingDtoList(works),
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }
}