import { httpRequest } from './http';
import type { ApiResponse } from './model/response';
import type { UserItem } from './model/user_model';

export async function fetchUsers(params?: { skip?: number; limit?: number }) {
  const query = new URLSearchParams();
  query.set('skip', String(params?.skip ?? 0));
  query.set('limit', String(params?.limit ?? 50));

  return httpRequest<ApiResponse<Array<UserItem>>>(`/users?${query.toString()}`);
}
