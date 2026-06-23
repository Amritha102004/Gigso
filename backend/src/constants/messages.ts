export const MESSAGES = {
  // User
  USER_NOT_FOUND: "User not found",
  USER_CREATED: "User created successfully",
  USER_SUSPENDED: "Your account has been suspended. Please contact support.",
  USER_DATA_MISSING: "User data not found in OTP record",

  // Auth
  INVALID_ROLE: "Invalid role. Only 'worker' and 'owner' are allowed to register.",
  INVALID_CREDENTIALS: "Invalid email or password",
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logged out successfully",
  TOKEN_REFRESHED: "Token refreshed successfully",
  GOOGLE_LOGIN_SUCCESS: "Google login successful",
  ROLE_REQUIRED: "Role must be selected before Google login.",

  // OTP
  OTP_SENT: "OTP sent successfully",
  OTP_INVALID: "Invalid OTP",
  OTP_EXPIRED: "OTP not found or expired",
  OTP_RESEND_SUCCESS: "New OTP sent successfully",
  OTP_VERIFY_SUCCESS: "OTP verified successfully. Proceed to reset password.",
  NO_PENDING_OTP: "No pending request found for this email.",

  // Password
  PASSWORD_RESET_SUCCESS: "Password reset successful",
  FORGOT_PASSWORD_SENT: "If your email is registered, you will receive an OTP.",

  // Profile
  WORKER_PROFILE_SETUP: "Worker profile setup successfully",
  WORKER_PROFILE_FETCHED: "Worker profile fetched successfully",
  OWNER_PROFILE_SETUP: "Owner profile setup successfully",
  OWNER_PROFILE_FETCHED: "Owner profile fetched successfully",

  // Admin
  USERS_FETCHED: "Users fetched successfully",
  DETAILS_FETCHED: "Details fetched successfully",
  OWNER_APPROVED: "Owner approved successfully",
  USER_STATUS_UPDATED: "User status updated successfully",

  // Tokens
  NO_REFRESH_TOKEN: "No refresh token provided",
  INVALID_REFRESH_TOKEN: "Invalid or expired refresh token",

  // Server
  SERVER_ERROR: "Internal server error",

  // Gig Module
  GIG_CREATED: "Gig created successfully",
  GIG_FETCHED: "Gig fetched successfully",
  GIGS_FETCHED: "Gigs fetched successfully",
  GIG_UPDATED: "Gig updated successfully",
  GIG_DELETED: "Gig deleted successfully",
  GIG_PUBLISHED: "Gig published successfully",
  GIG_COMPLETED: "Gig marked as completed successfully",
  CATEGORIES_FETCHED: "Categories fetched successfully",
  NOT_APPROVED: "Owner account is not approved to perform this action",
  GIG_NOT_FOUND: "Gig not found",
  UNAUTHORIZED_GIG_ACCESS: "Unauthorized access to this gig",

  // Admin Category Module
  CATEGORY_CREATED: "Category created successfully",
  CATEGORY_UPDATED: "Category updated successfully",
  CATEGORY_DELETED: "Category deleted successfully",
  CATEGORY_ALREADY_EXISTS: "Category name already exists",
};
