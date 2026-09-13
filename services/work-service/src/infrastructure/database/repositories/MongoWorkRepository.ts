import { injectable } from "tsyringe";
import { IWorkRepository } from "../../../domain/repositories/IWorkRepository";
import { Work } from "../../../domain/entities/Work";
import { WorkModel, WorkTocument } from "../models/WorkSchema";
import { FilterQuery, PipelineStage } from "mongoose";
import { LiveWorkBucketCounts, LiveWorksQueryOptions, UserBucketCounts, UserWorksQueryOptions, WorkerBucketCounts, WorkerWorksQueryOptions } from "../../../domain/types/IWorkRepository";

// Shape returned by the $geoNear aggregation — adds calculatedDistance on top of the document
type WorkGeoResult = WorkTocument & { calculatedDistance: number };

@injectable()
export class MongoWorkRepository implements IWorkRepository {
    async create(work: Work): Promise<Work> {
        const createdWork = await WorkModel.create(work);
        return this.mapToEntity(createdWork);
    }

    async findById(id: string): Promise<Work | null> {
        const work = await WorkModel.findById(id);
        return work ? this.mapToEntity(work) : null;
    }

    async findByUserId(userId: string): Promise<Work[]> {
        const works = await WorkModel.find({ userId }).sort({ createdAt: -1 });
        return works.map(w => this.mapToEntity(w));
    }

    async findAll(filters?: {
        search?: string;
        status?: string;
        page?: number;
        limit?: number;
        latitude?: number;
        longitude?: number;
        maxDistance?: number;
    }): Promise<{ works: Work[]; total: number }> {
        const {
            search = '',
            status = 'all',
            page = 1,
            limit = 10,
            latitude,
            longitude,
            maxDistance
        } = filters || {};

        const skip = (page - 1) * limit;

        const hasGeoFilter = latitude !== undefined &&
            longitude !== undefined &&
            maxDistance !== undefined;

        if (hasGeoFilter) {
            const matchQuery: FilterQuery<WorkTocument> = {};

            if (search && search.trim()) {
                matchQuery.$or = [
                    { workTitle: { $regex: search, $options: 'i' } },
                    { workCategory: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { manualAddress: { $regex: search, $options: 'i' } },
                    { landmark: { $regex: search, $options: 'i' } }
                ];
            }

            if (status !== 'all') {
                matchQuery.status = status as WorkTocument['status'];
            }

            const pipeline: PipelineStage[] = [
                {
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [longitude, latitude]
                        },
                        distanceField: "calculatedDistance",
                        maxDistance: maxDistance * 1000, // Convert km to meters
                        spherical: true,
                        query: matchQuery
                    }
                },
                { $skip: skip },
                { $limit: limit }
            ];

            const works = await WorkModel.aggregate<WorkGeoResult>(pipeline);

            const countPipeline: PipelineStage[] = [
                {
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [longitude, latitude]
                        },
                        distanceField: "calculatedDistance",
                        maxDistance: maxDistance * 1000,
                        spherical: true,
                        query: matchQuery
                    }
                },
                { $count: "total" }
            ];

            const countResult = await WorkModel.aggregate<{ total: number }>(countPipeline);
            const total = countResult.length > 0 ? countResult[0].total : 0;

            return {
                works: works.map(w => this.mapToEntity(w)),
                total
            };
        }

        const query: FilterQuery<WorkTocument> = {};

        if (search && search.trim()) {
            query.$or = [
                { workTitle: { $regex: search, $options: 'i' } },
                { workCategory: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { manualAddress: { $regex: search, $options: 'i' } },
                { landmark: { $regex: search, $options: 'i' } }
            ];
        }

        if (status !== 'all') {
            query.status = status as WorkTocument['status'];
        }

        const [works, total] = await Promise.all([
            WorkModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            WorkModel.countDocuments(query)
        ]);

        return {
            works: works.map(w => this.mapToEntity(w)),
            total
        };
    }

    async update(id: string, workData: Partial<Work>): Promise<Work | null> {
        const updated = await WorkModel.findByIdAndUpdate(
            id,
            { ...workData, updatedAt: new Date() },
            { new: true }
        );
        return updated ? this.mapToEntity(updated) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await WorkModel.findByIdAndDelete(id);
        return !!result;
    }

    async getMyWorks(userId: string): Promise<{ works: Work[] | null }> {
        const works = await WorkModel.find({ userId }).sort({ createdAt: -1 });
        return {
            works: works.length > 0 ? works.map(w => this.mapToEntity(w)) : null
        };
    }

    async getMyWorksPaginated(
        userId: string,
        options: UserWorksQueryOptions
    ): Promise<{ works: Work[]; total: number }> {
        const { page, limit, bucket } = options;
        const skip = (page - 1) * limit;

        const query: FilterQuery<WorkTocument> = { userId };

        switch (bucket) {
            case 'active':
                query.status = { $in: ['assigned', 'in-progress'] };
                break;
            case 'completed':
                query.status = 'completed';
                break;
            case 'pending':
                query.status = 'pending';
                break;
            case 'cancelled':
                query.status = 'cancelled';
                break;
            case 'all':
            default:
                break;
        }

        const [works, total] = await Promise.all([
            WorkModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            WorkModel.countDocuments(query),
        ]);

        return { works: works.map((w) => this.mapToEntity(w)), total };
    }

    async countUserWorkBuckets(userId: string): Promise<UserBucketCounts> {
        const base: FilterQuery<WorkTocument> = { userId };

        const [all, active, completed, pending, cancelled] = await Promise.all([
            WorkModel.countDocuments(base),
            WorkModel.countDocuments({ ...base, status: { $in: ['assigned', 'in-progress'] } }),
            WorkModel.countDocuments({ ...base, status: 'completed' }),
            WorkModel.countDocuments({ ...base, status: 'pending' }),
            WorkModel.countDocuments({ ...base, status: 'cancelled' }),
        ]);

        return { all, active, completed, pending, cancelled };
    }

    async getLiveWorksByUserId(
        userId: string,
        options: LiveWorksQueryOptions
    ): Promise<{ works: Work[]; total: number }> {
        const { page, limit, bucket } = options;
        const skip = (page - 1) * limit;

        const query: FilterQuery<WorkTocument> = { userId };

        // Two states only, driven by `status` — not `progress` — so a work
        // moves tabs the instant the worker marks it completed, regardless
        // of any stale progress value.
        query.status = bucket === 'completed'
            ? 'completed'
            : { $in: ['assigned', 'in-progress'] };

        const [works, total] = await Promise.all([
            WorkModel.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit),
            WorkModel.countDocuments(query),
        ]);

        return { works: works.map((w) => this.mapToEntity(w)), total };
    }

    async countLiveWorkBuckets(userId: string): Promise<LiveWorkBucketCounts> {
        const base: FilterQuery<WorkTocument> = { userId };

        const [active, completed] = await Promise.all([
            WorkModel.countDocuments({ ...base, status: { $in: ['assigned', 'in-progress'] } }),
            WorkModel.countDocuments({ ...base, status: 'completed' }),
        ]);

        return { active, completed };
    }

    async findByWorkerId(
        workerId: string,
        options: WorkerWorksQueryOptions
    ): Promise<{ works: Work[]; total: number }> {
        const { page, limit, bucket, startDate, endDate } = options;
        const skip = (page - 1) * limit;

        const query: FilterQuery<WorkTocument> = {
            workerId,
            status: { $in: ['assigned', 'in-progress', 'completed'] },
        };

        switch (bucket) {
            case 'assigned':
                //just assigned, worker hasn't marked any progress yet
                query.progress = { $exists: false };
                break;
            case 'started':
                query.progress = 'started';
                break;
            case 'ongoing':
                query.progress = 'ongoing';
                break;
            case 'completed':
                query.progress = 'completed';
                break;
            case 'all':
            default:
                break; //no progress filter
        }

        if (startDate || endDate) {
            query.createdAt = {
                ...(startDate ? { $gte: new Date(startDate) } : {}),
                ...(endDate ? { $lte: new Date(endDate) } : {}),
            };
        }

        const [works, total] = await Promise.all([
            WorkModel.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit),
            WorkModel.countDocuments(query),
        ]);

        return { works: works.map((w) => this.mapToEntity(w)), total };
    }

    async countWorkerBuckets(workerId: string): Promise<WorkerBucketCounts> {
        const base: FilterQuery<WorkTocument> = {
            workerId,
            status: { $in: ['assigned', 'in-progress', 'completed'] },
        };

        const [all, assigned, started, ongoing, completed] = await Promise.all([
            WorkModel.countDocuments(base),
            WorkModel.countDocuments({ ...base, progress: { $exists: false } }),
            WorkModel.countDocuments({ ...base, progress: 'started' }),
            WorkModel.countDocuments({ ...base, progress: 'ongoing' }),
            WorkModel.countDocuments({ ...base, progress: 'completed' }),
        ]);

        return { all, assigned, started, ongoing, completed };
    }

    async countCompletedByWorkerId(workerId: string): Promise<number> {
        return WorkModel.countDocuments({ workerId, status: "completed" });
    }

    // dashboard
    async countActiveByWorkerId(workerId: string): Promise<number> {
        return WorkModel.countDocuments({
            workerId,
            status: { $in: ['assigned', 'in-progress'] }
        });
    }

    async countDueThisWeek(workerId: string): Promise<number> {
        const now = new Date();
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (7 - now.getDay()));

        const nowStr = now.toISOString().split('T')[0];
        const endStr = endOfWeek.toISOString().split('T')[0];

        return WorkModel.countDocuments({
            workerId,
            status: { $in: ['assigned', 'in-progress'] },
            $or: [
                { endDate: { $gte: nowStr, $lte: endStr } },
                { date: { $gte: nowStr, $lte: endStr } }
            ]
        });
    }

    async getMonthlyCompletedCounts(workerId: string, months: number): Promise<{ month: number; year: number; count: number }[]> {
        const start = new Date();
        start.setMonth(start.getMonth() - (months - 1));
        start.setDate(1);
        start.setHours(0, 0, 0, 0);

        const result = await WorkModel.aggregate([
            {
                $match: {
                    workerId,
                    status: 'completed',
                    updatedAt: { $gte: start }
                }
            },
            {
                $group: {
                    _id: { month: { $month: "$updatedAt" }, year: { $year: "$updatedAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        return result.map(r => ({ month: r._id.month, year: r._id.year, count: r.count }));
    }

    async getRecentCompletedWorks(workerId: string, limit: number): Promise<Work[]> {
        const works = await WorkModel.find({ workerId, status: 'completed' })
            .sort({ updatedAt: -1 })
            .limit(limit);
        return works.map(w => this.mapToEntity(w));
    }

    async countAllActive(): Promise<number> {
        return WorkModel.countDocuments({ status: { $in: ['assigned', 'in-progress'] } });
    }

    async countAllCompleted(): Promise<number> {
        return WorkModel.countDocuments({ status: 'completed' });
    }

    private mapToEntity(doc: WorkTocument | WorkGeoResult): Work {
        return {
            id: doc._id.toString(),
            userId: doc.userId,
            workTitle: doc.workTitle,
            workCategory: doc.workCategory,
            workType: doc.workType,
            date: doc.date,
            startDate: doc.startDate,
            endDate: doc.endDate,
            time: doc.time,
            description: doc.description,

            voiceFile: doc.voiceFile,
            videoFile: doc.videoFile,
            beforeImage: doc.beforeImage,
            images: doc.images ?? [],
            videos: doc.videos ?? [],

            duration: doc.duration,
            budget: doc.budget,
            location: doc.location,
            currentLocation: doc.currentLocation,
            manualAddress: doc.manualAddress,
            landmark: doc.landmark,
            contactNumber: doc.contactNumber,
            petrolAllowance: doc.petrolAllowance,
            extraRequirements: doc.extraRequirements,
            anythingElse: doc.anythingElse,
            termsAccepted: doc.termsAccepted,
            status: doc.status,
            progress: doc.progress,
            workerId: doc.workerId,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        };
    }
}