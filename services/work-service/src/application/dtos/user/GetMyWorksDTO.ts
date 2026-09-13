import { UserWorkBucket } from "../../../domain/types/IWorkRepository";

export interface GetMyWorksParamsDTO {
  userId: string;
  page?: number;
  limit?: number;
  bucket?: UserWorkBucket;
}