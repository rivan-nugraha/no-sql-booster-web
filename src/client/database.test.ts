import { httpRequest } from './http';
import type { ApiResponse } from './model/response';

export async function testDatabaseConnection(uri: string) {
  return httpRequest<ApiResponse<{ ok: boolean }>>('/databases/test', {
    method: 'POST',
    body: { uri },
  });
}
