export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterErrorResponse {
  errors: string[];
  timestamp: string;
  status: number;
}
