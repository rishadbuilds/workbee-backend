import { UserWorkBucket } from "../../../domain/repositories/IWorkRepository";

export interface GetMyWorksParamsDTO {
  userId: string;
  page?: number;
  limit?: number;
  bucket?: UserWorkBucket;
}