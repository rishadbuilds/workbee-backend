import { injectable } from "tsyringe";
import { MongoBaseRepository } from "./MongoBaseRepository";
import { Worker } from "../../../domain/entities/Worker";
import { IWorkerRepository } from "../../../domain/repositories/IWorkerRepository";
import { WorkerModel, WorkerDocument, WorkerStatus } from "../models/WorkerSchema";
import mongoose, { FilterQuery } from "mongoose";
import { ResponseMessage } from "../../../shared/constants/ResponseMessages";

@injectable()
export class MongoWorkerRepository extends MongoBaseRepository<Worker, WorkerDocument> implements IWorkerRepository {
  constructor() {
    super(WorkerModel);
  }

  protected map(worker: WorkerDocument): Worker {
    return {
      id: worker._id.toString(),
      name: worker.name,
      email: worker.email,
      phone: worker.phone,
      password: worker.password,
      address: worker.address,
      bio: worker.bio,
      workTypes: worker.workTypes,
      preferredWorks: worker.preferredWorks,
      confirmations: worker.confirmations,
      status: worker.status,
      isBlocked: worker.isBlocked,
      rejectionReason: worker.rejectionReason,
      rejectedAt: worker.rejectedAt,
      canReapply: worker.canReapply,

      workerProfileImage: worker.workerProfileImage,
      workerProfileImagePublicId: worker.workerProfileImagePublicId,

      isBlacklisted: worker.isBlacklisted,
      blacklistReason: worker.blacklistReason,
      blacklistedAt: worker.blacklistedAt,

      createdAt: worker.createdAt,
      updatedAt: worker.updatedAt
    }
  }

  async save(worker: Worker): Promise<Worker> {
    if (worker.id) {
      const updated = await WorkerModel.findByIdAndUpdate(worker.id, worker, { new: true });
      if (!updated) {
        throw new Error(`Worker not found for update: ${worker.id}`);
      }
      return this.map(updated);
    } else {
      const newWorker = new WorkerModel(worker);
      const saved = await newWorker.save();
      return this.map(saved);
    }
  }

  async findByEmail(email: string): Promise<Worker | null> {
    const worker = await WorkerModel.findOne({ email });
    return worker ? this.map(worker) : null;
  }

  async reapply(id: string, data: Partial<Worker>): Promise<Worker> {
    const updated = await WorkerModel.findByIdAndUpdate(id, {
      ...data,
      status: "pending",
      rejectionReason: undefined,
      rejectedAt: undefined,
      updatedAt: new Date(),
    },
      { new: true }
    );
    if (!updated) throw new Error(ResponseMessage.WORKER.NOT_FOUND);
    return this.map(updated);
  }

  async findById(id: string): Promise<Worker | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const worker = await WorkerModel.findById(id);
    return worker ? this.map(worker) : null;
  }

  async getNewAppliers(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    status: 'all' | 'pending' | 'approved' | 'rejected' = 'all'
  ): Promise<{ workers: Worker[]; total: number }> {
    const skip = (page - 1) * limit;

    const searchQuery: FilterQuery<WorkerDocument> =
      status === 'all'
        ? { status: { $in: ["pending", "approved", "rejected"] } }
        : { status };

    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { "address.city": { $regex: search, $options: 'i' } },
        { "address.panchayath": { $regex: search, $options: 'i' } },
        { "address.pincode": { $regex: search, $options: 'i' } },
        { "address.state": { $regex: search, $options: 'i' } },
      ];
    }

    const [workers, total] = await Promise.all([
      WorkerModel.find(searchQuery)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      WorkerModel.countDocuments(searchQuery)
    ]);

    return {
      workers: workers.map(w => this.map(w as unknown as WorkerDocument)),
      total
    };
  }

  async getAllWorkers(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    status: string = "all"
  ): Promise<{ workers: Worker[]; total: number }> {
    const skip = (page - 1) * limit;

    const searchQuery: FilterQuery<WorkerDocument> = { status: WorkerStatus.APPROVED };

    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { "address.city": { $regex: search, $options: 'i' } },
        { "address.panchayath": { $regex: search, $options: 'i' } },
        { "address.pincode": { $regex: search, $options: 'i' } },
        { "address.state": { $regex: search, $options: 'i' } },
      ];
    }

    if (status !== "all") {
      searchQuery.isBlocked = status === "blocked";
    }

    const [workers, total] = await Promise.all([
      WorkerModel.find(searchQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      WorkerModel.countDocuments(searchQuery)
    ]);

    return {
      workers: workers.map(w => this.map(w as unknown as WorkerDocument)),
      total
    };
  }

  async findByIds(ids: string[]): Promise<Worker[]> {
    const workers = await WorkerModel.find({
      _id: { $in: ids }
    }).select('-password').lean();

    return workers.map(worker => this.map(worker as unknown as WorkerDocument));
  }

  async getWorkersCount(): Promise<number> {
    const count = await WorkerModel.countDocuments({ status: WorkerStatus.APPROVED });
    return count;
  }

  async updateProfileImage(workerId: string, imageUrl: string, publicId: string): Promise<boolean> {
    const result = await WorkerModel.findByIdAndUpdate(
      workerId,
      {
        $set: {
          workerProfileImage: imageUrl,
          workerProfileImagePublicId: publicId
        }
      },
      { new: true }
    );

    return !!result;
  }

  async updatePassword(workerId: string, hashedPassword: string): Promise<void> {
    await WorkerModel.findByIdAndUpdate(workerId, { password: hashedPassword });
  }

  async countPendingAppliers(): Promise<number> {
    return WorkerModel.countDocuments({ status: WorkerStatus.PENDING });
  }

  async countCreatedBetween(status: WorkerStatus, start: Date, end: Date): Promise<number> {
    return WorkerModel.countDocuments({
      status,
      createdAt: { $gte: start, $lt: end }
    });
  }

  async updateWorkerProfile(userId: string,
    data: {
      name: string;
      phone: string;
      address: {
        state: string;
        pincode: string;
        panchayath: string;
        city: string;
        place: string;
      };
      bio: string;
    }): Promise<Worker | null> {

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    const updatedWorker = await WorkerModel.findByIdAndUpdate(userId, {
      $set: {
        name: data.name,
        phone: data.phone,
        address: data.address,
        bio: data.bio,
      },
    }, {
      new: true,
      runValidators: true,
    });
    return updatedWorker ? this.map(updatedWorker) : null;
  }

}