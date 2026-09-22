import { Address } from "../../../domain/entities/Address";

export interface GetWorkerProfileSettingsDto {
    workerId: string;
}

export interface WorkerProfileSettingsResponseDto {
    id: string;
    name: string;
    email: string;
    phone: string;
    // location: string;
    // workType: string;
    address: Address;
    workTypes: string[];
    bio?:string;
    preferredWorks: string[];
    workerProfileImage?: string;
    workerProfileImagePublicId?: string;
    createdAt?: Date;
}

export interface UpdateWorkerProfileImageDto {
    workerId: string;
    imageUrl: string;
    publicId: string;
}

export interface UpdateWorkerProfileImageResponseDto {
    isUpdated: boolean;
}