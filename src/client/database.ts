import { httpRequest } from './http';
import type { ApiResponse } from './model/response';
import type { CatalogItem, CollectionItem, CreateDatabasePayload, DatabaseItem } from './model/database_model';

export async function createDatabase(payload: CreateDatabasePayload) {
  return httpRequest<ApiResponse<{ _id: string }>>('/databases', {
    method: 'POST',
    body: payload,
  });
}

export async function listDatabases() {
  return httpRequest<ApiResponse<Array<DatabaseItem>>>('/databases?skip=0&limit=200');
}

export async function listDatabaseCatalog(id: string) {
  return httpRequest<ApiResponse<Array<CatalogItem>>>(`/databases/${encodeURIComponent(id)}/catalog`);
}

export async function listDatabaseCollections(id: string, dbName: string) {
  return httpRequest<ApiResponse<Array<CollectionItem>>>(
    `/databases/${encodeURIComponent(id)}/catalog/${encodeURIComponent(dbName)}/collections`
  );
}

export async function listCollectionDocuments(
  id: string,
  dbName: string,
  collectionName: string,
  skip = 0,
  limit = 50,
  filter?: string,
) {
  let url = `/databases/${encodeURIComponent(id)}/catalog/${encodeURIComponent(dbName)}/collections/${encodeURIComponent(collectionName)}/documents?skip=${skip}&limit=${limit}`;
  if (filter) {
    url += `&filter=${encodeURIComponent(filter)}`;
  }
  return httpRequest<ApiResponse<Array<Record<string, unknown>>>>(url);
}

export async function updateCollectionDocument(
  id: string,
  dbName: string,
  collectionName: string,
  documentId: string,
  update: Record<string, unknown>,
) {
  return httpRequest<ApiResponse<{ modifiedCount: number }>>(
    `/databases/${encodeURIComponent(id)}/catalog/${encodeURIComponent(dbName)}/collections/${encodeURIComponent(collectionName)}/documents/${encodeURIComponent(documentId)}`,
    { method: 'PUT', body: update },
  );
}

export async function runDatabaseScript(
  id: string,
  dbName: string,
  script: string,
  limit?: number,
) {
  return httpRequest<ApiResponse<unknown>>(
    `/databases/${encodeURIComponent(id)}/catalog/${encodeURIComponent(dbName)}/run`,
    { method: 'POST', body: { script, limit } },
  );
}
