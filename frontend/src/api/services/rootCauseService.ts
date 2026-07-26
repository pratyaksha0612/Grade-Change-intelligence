import { ApiBaseService } from '../../services/apiBase';
import { API_ENDPOINTS } from '../endpoints';
import type { RootCauseAnalyzeRequest, RootCauseAnalyzeResponse } from '../types';

export class RootCauseService extends ApiBaseService {
  /**
   * Fetches the root cause analysis for a specific prediction ID.
   */
  static async analyze(data: RootCauseAnalyzeRequest): Promise<import('../types').AsyncJobResponse> {
    return this.post<import('../types').AsyncJobResponse, RootCauseAnalyzeRequest>(
      API_ENDPOINTS.ROOT_CAUSE.ANALYZE, 
      data
    );
  }

  static async getResult(jobId: string): Promise<RootCauseAnalyzeResponse> {
    return this.get<RootCauseAnalyzeResponse>(
      `${API_ENDPOINTS.ROOT_CAUSE.RESULT}/${jobId}`
    );
  }
}
