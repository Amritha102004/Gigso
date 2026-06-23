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
  CHANGE_PASSWORD:'/auth/change-password',
} as const;

export const ADMIN_ROUTES = {
  USERS:          '/admin/users',
  USER_BY_ID:     (id: string) => `/admin/users/${id}`,
  APPROVE_USER:   (id: string) => `/admin/users/${id}/approve`,
  SUSPEND_USER:   (id: string) => `/admin/users/${id}/suspend`,
  CATEGORIES:     '/admin/categories',
  CATEGORY_BY_ID: (id: string) => `/admin/categories/${id}`,
} as const;

export const PROFILE_ROUTES = {
  WORKER_SETUP: '/worker/profile/setup',
  OWNER_SETUP:  '/owner/profile/setup',
  WORKER_ME:    '/worker/profile/me',
  OWNER_ME:     '/owner/profile/me',
} as const;

export const GIG_ROUTES = {
  OWNER_GIGS:        '/owner/gigs',
  OWNER_GIG_BY_ID:   (id: string) => `/owner/gigs/${id}`,
  OWNER_GIG_PUBLISH: (id: string) => `/owner/gigs/${id}/publish`,
  OWNER_GIG_COMPLETE:(id: string) => `/owner/gigs/${id}/complete`,
  CATEGORIES:        '/owner/gigs/categories',
} as const;

