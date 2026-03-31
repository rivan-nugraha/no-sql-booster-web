export interface DatabaseItem {
  _id: string;
  name: string;
  uri: string;
  description?: string;
  icon?: string;
}

export interface CreateDatabasePayload {
  name: string;
  uri: string;
  description?: string;
  icon?: string;
}

export interface CatalogItem {
  name: string;
  sizeOnDisk?: number;
  empty?: boolean;
}

export interface CollectionItem {
  name: string;
  type: string;
  count: number;
  size: number;
  avgObjSize: number;
  storageSize: number;
  indexes: number;
  indexSize: number;
}
