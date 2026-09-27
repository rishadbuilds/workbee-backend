import { UserRole } from "workbee-common";

export interface IUserProfiles {
    id:string | undefined;
    name:string;
    email:string;
    role:UserRole;
}

export interface IGetUserProfilesBatchUseCase {
    execute(userIds:string[]):Promise<IUserProfiles[]>
}