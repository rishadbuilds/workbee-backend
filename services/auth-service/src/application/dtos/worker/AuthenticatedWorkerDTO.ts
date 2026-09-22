import { UserRole } from "workbee-common";
import { WorkerAddressDTO } from "./WorkerAddressDTO";

export interface AuthenticatedWorkerDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole.WORKER;
  address: WorkerAddressDTO;
  workTypes: string[];
  preferredWorks: string[];
  status: string;
}