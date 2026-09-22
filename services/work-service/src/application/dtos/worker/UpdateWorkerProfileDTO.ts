import { Address } from "../../../domain/entities/Address";

export interface UpdateWorkerProfileReqDTO {
  userId: string;
  name: string;
  phone: string;
  address: Address;
  workTypes: string[];
  bio: string;
}

export interface WorkerProfileResponseDTO {
    id?: string;
    name: string;
    email: string;
    phone: string;
    address: Address;
    workTypes: string[];
    preferredWorks: string[];
    bio?: string;
    workerProfileImage?: string;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
}