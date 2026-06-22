export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  Success: boolean;
  Message: string;
  Email: string;
  OtpExpiredAt: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  Success: boolean;
  Message: string;
}
