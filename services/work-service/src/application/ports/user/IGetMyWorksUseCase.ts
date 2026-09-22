// import { Work } from "../../../domain/entities/Work";
// import { GetMyWorksParamsDTO } from "../../dtos/user/GetMyWorksDTO";

// export interface IGetMyWorksUseCase {
//     execute(params: GetMyWorksParamsDTO): Promise<{ works: Work[] | null }>;
// }

import { Work } from "../../../domain/entities/Work";
import { GetMyWorksParamsDTO } from "../../dtos/user/GetMyWorksDTO";

export interface IGetMyWorksUseCase {
  execute(params: GetMyWorksParamsDTO): Promise<{
    works: Work[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    counts: {
      all: number;
      active: number;
      completed: number;
      pending: number;
      cancelled: number;
    };
  }>;
}