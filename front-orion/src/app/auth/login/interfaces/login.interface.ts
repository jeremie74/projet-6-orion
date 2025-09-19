export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginSuccessResponse {
  token: string;
  username: string;
}

export interface LoginErrorResponse {
  errors: string[];
  timestamp: string;
  status: number;
}
