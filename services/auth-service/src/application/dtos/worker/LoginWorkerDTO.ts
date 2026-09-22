// export interface WorkerLoginRequestDTO {
//   email: string;
//   password: string;
// }

// export interface WorkerLoginResponseDTO {
//   worker: {
//     id: string;
//     name: string;
//     email: string;
//     phone: string;
//     role: string;
//     location: string;
//     workType: string;
//     preferredWorks: string[];
//     status: string;
//   };
//   accessToken: string;
//   refreshToken: string;
// }


import { UserRole } from "workbee-common";
import { WorkerAddressDTO } from "./WorkerAddressDTO";

export interface WorkerLoginRequestDTO {
  email: string;
  password: string;
}

export interface WorkerLoginResponseDTO {
  worker: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole.WORKER;
    address: WorkerAddressDTO;
    workTypes: string[];
    preferredWorks: string[];
    status: string;
  };

  accessToken: string;
  refreshToken: string;
}