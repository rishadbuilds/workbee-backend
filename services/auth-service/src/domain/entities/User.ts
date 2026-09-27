import { UserRole } from "workbee-common";

/** User domain interface */

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  location?: string;
  bio?: string;
  isVerified: boolean;
  isBlocked: boolean;

  isBlacklisted?: boolean;
  blacklistReason?: string;
  blacklistedAt?: Date;
  
  role: UserRole;
  phone?: string;
  countofpost?: number;
  numberOfComplaints?: number;
  userProfileImage?: string;
  userProfileImagePublicId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type NewUser = Omit<User, "id" | "isBlocked"> & { isBlocked?: boolean }