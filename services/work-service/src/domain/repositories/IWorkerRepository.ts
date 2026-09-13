import { WorkerStatus } from "../../infrastructure/database/models/WorkerSchema";
import { Address } from "../entities/Address";
import { NewWorker, Worker } from "../entities/Worker";

export interface IWorkerRepository {
    save(worker: NewWorker): Promise<Worker>;
    findByEmail(email: string): Promise<Worker | null>;
    reapply(id: string, data: Partial<NewWorker>): Promise<Worker>;
    findById(id: string): Promise<Worker | null>;
    getNewAppliers(
        page: number, limit: number, search: string, status: 'all' | 'pending' | 'approved' | 'rejected'
    ): Promise<{ workers: Worker[]; total: number }>;
    getAllWorkers(page: number, limit: number, search: string, status?: string): Promise<{ workers: Worker[]; total: number }>;

    getWorkersCount(): Promise<number>;
    findByIds(ids: string[]): Promise<Worker[]>;

    updateProfileImage(userId: string, imageUrl: string, publicId: string): Promise<boolean>;
    updatePassword(workerId: string, hashedPassword: string): Promise<void>;
    updateWorkerProfile(
    userId: string,
    data: {
      name: string;
      phone: string;
      address: Address;
      bio: string;
    }
  ): Promise<Worker | null>;

    countPendingAppliers(): Promise<number>;
    countCreatedBetween(status: WorkerStatus, start: Date, end: Date): Promise<number>;

}


