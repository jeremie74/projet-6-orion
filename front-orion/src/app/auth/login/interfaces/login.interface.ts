export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginSuccessResponse {
  token: string;
  userId: number;
  username: string;
}

export interface LoginErrorResponse {
  errors: string[];
  timestamp: string;
  status: number;
}
