import { injectable } from "tsyringe";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { User } from "../../../domain/entities/User";
import { UserDocument, UserModel } from "../models/UserSchema";
import { MongoBaseRepository } from "./MongoBaseRepository";
import { FilterQuery } from "mongoose";
import { escapeRegex } from "../../../shared/constants/Regex";

/** mongo user repository */

@injectable()
export class MongoUserRepository extends MongoBaseRepository<User, UserDocument> implements IUserRepository {
    constructor() {
        super(UserModel)
    }

    protected map(user: UserDocument): User {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
            phone: user.phone,
            location: user.location,
            bio: user.bio,
            role: user.role,
            isVerified: user.isVerified,
            isBlocked: user.isBlocked,
            isBlacklisted: user.isBlacklisted,
            blacklistReason: user.blacklistReason,
            blacklistedAt: user.blacklistedAt,
            userProfileImage: user.userProfileImage,
            userProfileImagePublicId: user.userProfileImagePublicId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await UserModel.findOne({ email })
        return user ? this.map(user) : null
    }

    async getUsers(
        page: number = 1,
        limit: number = 10,
        search: string = "",
        status: string = "all"
    ): Promise<{ users: User[], total: number }> {
        const skip = (page - 1) * limit;

        // Build query object
        const query: FilterQuery<UserDocument> = {};

        // Search filter
        if (search && search.trim()) {
            const term = search.trim();

            query.$or = [
                { name: { $regex: term, $options: 'i' } },
                { email: { $regex: term, $options: 'i' } },
                // user id: full id or any part of it (e.g. the 6 chars shown in the table)
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: "$_id" },
                            regex: escapeRegex(term),
                            options: "i",
                        },
                    },
                },
            ];
        }

        // Status filter
        if (status !== "all") {
            query.isBlocked = status === "blocked";
        }

        const [users, total] = await Promise.all([
            UserModel.find(query)
                .skip(skip)
                .limit(limit),
            UserModel.countDocuments(query)
        ]);

        return {
            users: users.map(user => this.map(user)),
            total
        };
    }

    async findByIds(ids: string[]): Promise<User[]> {
        const users = await UserModel.find({
            _id: { $in: ids }
        }).select('-password');
        return users.map(user => this.map(user));
    }


    async save(user: User): Promise<User> {
        if (user.id) {
            const updated = await UserModel.findByIdAndUpdate(user.id, user, { new: true })
            return this.map(updated!)
        } else {
            const newUser = new UserModel(user)
            const saved = await newUser.save()
            return this.map(saved)
        }
    }

    async saveNewPassword(userId: string, newHashedPassword: string): Promise<boolean> {
        const result = await UserModel.updateOne({ _id: userId }, { $set: { password: newHashedPassword } })
        return result.modifiedCount == 1
    }

    async updateProfileImage(userId: string, imageUrl: string, publicId: string): Promise<boolean> {
        const result = await UserModel.findByIdAndUpdate(userId, {
            $set: {
                userProfileImage: imageUrl,
                userProfileImagePublicId: publicId
            }
        }, { new: true })
        return !!result;
    }

    async countByRole(role: string): Promise<number> {
        return UserModel.countDocuments({ role });
    }

    async countCreatedBetween(role: string, start: Date, end: Date): Promise<number> {
        return UserModel.countDocuments({
            role,
            createdAt: { $gte: start, $lt: end }
        });
    }

    async updateProfile(userId: string, data: { name: string; phone: string; location?: string; bio?: string; }): Promise<User | null> {
        const updatedUser = await UserModel.findByIdAndUpdate(userId, {
            $set: {
                name: data.name,
                phone: data.phone,
                location: data.location,
                bio: data.bio,
            },
        }, {
            new: true,
            runValidators: true,
        });

        return updatedUser ? this.map(updatedUser) : null;
    }
}