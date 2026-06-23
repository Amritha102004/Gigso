// Shared type definitions for API responses

export type UserRole = 'worker' | 'owner' | 'admin';

// user object returned from backend
export interface UserDTO {
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  profileImage?: string;
  isApproved: boolean;
  isSuspended: boolean;
  isProfileCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkerProfileResponseDTO {
  id: string;
  userId: string;
  skills: string[];
  portfolio: string[];
  age?: number;
  bio?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OwnerProfileResponseDTO {
  id: string;
  userId: string;
  businessName?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  description?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

//Auth response returned on login, google login
export interface AuthResponse {
  message: string;
  accessToken: string;
  user: UserDTO;
}

//Paginated response returned from admin user list endpoints
export interface PaginatedUsersResponse {
  users: UserDTO[];
  total: number;
  page: number;
  totalPages: number;
}

// Signup, OTP response
export interface SignupOtpResponse {
  message: string;
}

//OTP verify (registration) response
export interface VerifyOtpResponse {
  message: string;
  user?: UserDTO;
}

export interface CategoryDTO {
  id: string;
  name: string;
  description: string;
  icon: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GigRoleDTO {
  id: string;
  gigId: string;
  roleName: string;
  spots: number;
  payPerPerson: number;
}

export interface GigResponseDTO {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  category: CategoryDTO;
  location: string;
  eventDate: string;
  startTime: string;
  roles: GigRoleDTO[];
  totalBudget: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'paid';
  paymentStatus: 'unpaid' | 'paid';
  createdAt: string;
  updatedAt: string;
}

export interface GigListItemDTO {
  id: string;
  title: string;
  category: CategoryDTO;
  eventDate: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'paid';
  totalRoles: number;
  filledSpots: number;
  totalSpots: number;
}

