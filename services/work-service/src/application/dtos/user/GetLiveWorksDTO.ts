// import { LiveWorkBucket, LiveWorkBucketCounts } from "../../../domain/repositories/IWorkRepository";

// export interface GetLiveWorksParams {
//   userId: string;
//   page?: number;
//   limit?: number;
//   bucket?: LiveWorkBucket;
// }

// export interface GetLiveWorksResponseDto {
//   works: unknown[];

//   pagination: {
//     page: number;
//     limit: number;
//     total: number;
//     totalPages: number;
//   };

//   counts: LiveWorkBucketCounts;
// }

import { LiveWorkBucket, LiveWorkBucketCounts } from "../../../domain/types/IWorkRepository";

export interface GetLiveWorksParams {
  userId: string;
  page?: number;
  limit?: number;
  bucket?: LiveWorkBucket;
}

export interface GetLiveWorksResponseDto {
  works: unknown[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  counts: LiveWorkBucketCounts;
}
