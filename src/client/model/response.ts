export interface ApiResponse<T> {
  status: number;
  data: T;
  message?: string;
  count?: number;
  error_message?: string;
}
