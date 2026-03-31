import { httpRequest } from './http';
import { sha256 } from './signature';
import type {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
} from './model/auth_model';
import type { ApiResponse } from './model/response';

export async function loginApi(body: LoginRequest) {
  return httpRequest<ApiResponse<LoginResponse>>('/auth/login', {
    method: 'POST',
    body,
  });
}

export async function refreshApi(body: RefreshRequest, token?: string) {
  return httpRequest<ApiResponse<RefreshResponse>>('/auth/refresh', {
    method: 'POST',
    body,
    token,
    skipRefresh: true,
  });
}

export interface RegisterSuRequest {
  user_id: string;
  user_name: string;
  password: string;
  secret_key: string;
}

export async function registerSuApi(body: RegisterSuRequest) {
  const hashedSecret = await sha256(body.secret_key);
  const { secret_key, ...payload } = body;
  return httpRequest<ApiResponse<{ _id: string }>>('/auth/register-su', {
    method: 'POST',
    body: payload,
    headers: { 'secret-key': hashedSecret },
  });
}
