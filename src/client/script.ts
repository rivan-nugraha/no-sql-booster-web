import { httpRequest } from './http';

type ApiResponse<T> = { status: number; data?: T; message?: string; count?: number };

export interface ScriptItem {
  _id: string;
  name: string;
  database_id?: string;
  db_name?: string;
  script: string;
  created_by?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function listScripts(databaseId?: string, dbName?: string) {
  const params = new URLSearchParams();
  if (databaseId) params.set("database_id", databaseId);
  if (dbName) params.set("db_name", dbName);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return httpRequest<ApiResponse<ScriptItem[]>>(`/scripts${qs}`);
}

export async function createScript(payload: {
  name: string;
  database_id?: string;
  db_name?: string;
  script: string;
}) {
  return httpRequest<ApiResponse<{ _id: string }>>(
    '/scripts',
    { method: 'POST', body: payload },
  );
}

export async function updateScript(id: string, payload: { name?: string; script?: string }) {
  return httpRequest<ApiResponse<unknown>>(
    `/scripts/${encodeURIComponent(id)}`,
    { method: 'PUT', body: payload },
  );
}

export async function deleteScript(id: string) {
  return httpRequest<ApiResponse<unknown>>(
    `/scripts/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  );
}
