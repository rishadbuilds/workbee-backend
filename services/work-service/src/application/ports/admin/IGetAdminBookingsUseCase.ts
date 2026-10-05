import { GetAdminBookingsDto, GetAdminBookingsResponseDto } from "../../dtos/admin/GetAdminBookingsDTOs";

export interface IGetAdminBookingsUseCase {
  execute(dto: GetAdminBookingsDto): Promise<GetAdminBookingsResponseDto>;
}