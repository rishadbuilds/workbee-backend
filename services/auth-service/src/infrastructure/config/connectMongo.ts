import mongoose from "mongoose";
import { logger } from "../logger/logger";
import { ENV } from "./env";

/** mongodb database connection in auth service */

export const connectDatabase = async () => {
    try {
        await mongoose.connect(ENV.MONGO_URI)
        logger.info('mongodb connected')
    }catch(err){
        logger.warn('database connection failed',err)
        process.exit(1)
    }
};

