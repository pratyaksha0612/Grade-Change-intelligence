import { apiClient } from '../api/client';
import type { PaginatedResponse } from '../types/api';

export class ApiBaseService {
  protected static async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await apiClient.get<T>(url, { params });
    return response.data;
  }

  protected static async getPaginated<T>(url: string, params?: Record<string, unknown>): Promise<PaginatedResponse<T>> {
    const response = await apiClient.get<PaginatedResponse<T>>(url, { params });
    return response.data;
  }

  protected static async post<T, D = unknown>(url: string, data?: D): Promise<T> {
    const response = await apiClient.post<T>(url, data);
    return response.data;
  }

  protected static async put<T, D = unknown>(url: string, data?: D): Promise<T> {
    const response = await apiClient.put<T>(url, data);
    return response.data;
  }

  protected static async delete<T>(url: string): Promise<T> {
    const response = await apiClient.delete<T>(url);
    return response.data;
  }
}
