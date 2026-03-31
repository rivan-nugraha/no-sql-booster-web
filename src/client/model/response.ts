export interface ApiResponse<T> {
  status: number;
  data: T;
  message?: string;
  count?: number;
}
