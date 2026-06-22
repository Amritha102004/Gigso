export const AUTH_ROUTES = {
  SIGNUP:         '/auth/signup',
  VERIFY_OTP:     '/auth/verify-otp',
  RESEND_OTP:     '/auth/resend-otp',
  LOGIN:          '/auth/login',
  GOOGLE_LOGIN:   '/auth/google',
  FORGOT_PASSWORD:'/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  LOGOUT:         '/auth/logout',
  REFRESH_TOKEN:  '/auth/refresh-token',
} as const;

export const ADMIN_ROUTES = {
  USERS:          '/admin/users',
  USER_BY_ID:     (id: string) => `/admin/users/${id}`,
  APPROVE_USER:   (id: string) => `/admin/users/${id}/approve`,
  SUSPEND_USER:   (id: string) => `/admin/users/${id}/suspend`,
} as const;

export const PROFILE_ROUTES = {
  WORKER_SETUP: '/profile/worker/setup',
  OWNER_SETUP:  '/profile/owner/setup',
  WORKER_ME:    '/profile/worker/me',
  OWNER_ME:     '/profile/owner/me',
} as const;
