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
};
