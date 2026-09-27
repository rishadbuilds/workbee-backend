import { inject, injectable } from "tsyringe";
import { IWorkRepository } from "../../../domain/repositories/IWorkRepository";

import { WorkMapper } from "../../mappers/WorkMapper";
import { PostWorkDto, WorkResponseDto } from "../../dtos/work/WorkDTO";

import { IPostWorkUseCase } from "../../ports/work/IPostWorkUseCase";
import { ErrorMessages } from "../../../shared/constants/ErrorMessages";

@injectable()
export class PostWorkUseCase implements IPostWorkUseCase {
    constructor(
        @inject("WorkRepository") private readonly _workRepository: IWorkRepository
    ) { }

    async execute(dto: PostWorkDto): Promise<WorkResponseDto> {

        // validation before setuping frontend validation
        if (!dto.userId) {
            throw new Error(ErrorMessages.AUTH.USER_ID_REQUIRED);
        }
        if (!dto.workTitle || !dto.workCategory || !dto.contactNumber) {
            throw new Error("Please fill all required fields");
        }
        if (!dto.workType) {
            throw new Error("Please select work duration type");
        }
        if (dto.workType === 'oneDay' && !dto.date) {
            throw new Error("Date is required for one day work");
        }
        if (dto.workType === 'multipleDay' && (!dto.startDate || !dto.endDate)) {
            throw new Error("Start date and end date are required for multiple day work");
        }
        if (!dto.time) {
            throw new Error("Time is required");
        }
        if (!dto.termsAccepted) {
            throw new Error("Please accept terms and conditions");
        }
        if (dto.description && dto.description.split(' ').length < 2) {
            throw new Error("Description must be at least 3 words");
        }

        if (dto.images && dto.images.length > 3) {
            throw new Error("You can upload a maximum of 3 images");
        }
        if (dto.videos && dto.videos.length > 3) {
            throw new Error("You can upload a maximum of 3 videos");
        }


        const work = WorkMapper.toEntity(dto);
        const createdWork = await this._workRepository.create(work);
        return WorkMapper.toResponseDto(createdWork);
    }
}