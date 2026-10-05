export interface GetAdminBookingsDto {
  page?: number;
  limit?: number;
  status?: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  fromDate?: string;
  toDate?: string;
}

export interface AdminBookingItemDto {
  id: string;
  workTitle: string;
  workCategory: string;
  workType: 'oneDay' | 'multipleDay';
  date?: string;
  startDate?: string;
  endDate?: string;
  time: string;
  duration?: string;
  budget?: string;
  contactNumber: string;
  manualAddress?: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  progress?: 'started' | 'ongoing' | 'completed' | null;
  createdAt: Date;
}

export interface GetAdminBookingsResponseDto {
  works: AdminBookingItemDto[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface AdminMediaItemDto {
  url: string;
  publicId: string;
}

export interface AdminBookingItemDto {
  id: string;
  userId: string;
  workerId?: string;
  workTitle: string;
  workCategory: string;
  workType: 'oneDay' | 'multipleDay';
  date?: string;
  startDate?: string;
  endDate?: string;
  time: string;
  duration?: string;
  budget?: string;
  description: string;
  contactNumber: string;
  manualAddress?: string;
  landmark?: string;
  currentLocation?: string;
  petrolAllowance?: string;
  extraRequirements?: string;
  anythingElse?: string;
  images: AdminMediaItemDto[];
  videos: AdminMediaItemDto[];
  voiceFile?: AdminMediaItemDto | null;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  progress?: 'started' | 'ongoing' | 'completed' | null;
  createdAt: Date;
  updatedAt?: Date;
}