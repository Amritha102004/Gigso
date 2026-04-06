// Shared type definitions for API responses

export type UserRole = 'worker' | 'owner' | 'admin';

/** Shape of a user object returned from the backend (no password) */
export interface UserDTO {
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  isApproved: boolean;
  isSuspended: boolean;
  isProfileCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Auth response returned on login / google login */
export interface AuthResponse {
  message: string;
  accessToken: string;
  user: UserDTO;
}

/** Paginated response returned from admin user list endpoints */
export interface PaginatedUsersResponse {
  users: UserDTO[];
  total: number;
  page: number;
  totalPages: number;
}

/** Signup / OTP response */
export interface SignupOtpResponse {
  message: string;
}

/** OTP verify (registration) response */
export interface VerifyOtpResponse {
  message: string;
  user?: UserDTO;
}
