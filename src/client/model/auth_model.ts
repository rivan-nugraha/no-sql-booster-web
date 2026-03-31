export interface LoginRequest {
  user_id: string;
  password: string;
}

export interface LoginResponse {
  user_id: string;
  user_name: string;
  level: string;
  access_token: string;
  refresh_token: string;
}

export interface RefreshRequest {
  user_id: string;
  refresh_token: string;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}
