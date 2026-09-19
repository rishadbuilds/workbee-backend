import { container } from "tsyringe";

import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IOtpRepository } from "../../domain/repositories/IOtpRepository";

import { MongoUserRepository } from "../database/repositories/MongoUserRepository";
import { RedisOtpRepository } from "../database/repositories/redis/RedisOtpRepository";

//bind repositories
container.register<IUserRepository>("UserRepository",{useClass:MongoUserRepository})
container.register<IOtpRepository>("OtpRepository", { useClass: RedisOtpRepository });
