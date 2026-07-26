import { AxiosError } from 'axios';
import axios from 'axios';
import type { ApiError } from '../types/api';

export const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    if (error.response) {
      const data = error.response.data as ApiError;
      return data.detail || `Server error: ${error.response.status}`;
    } else if (error.request) {
      return 'Network error: Could not reach the server.';
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred.';
};
