import { ApiBaseService } from '../../services/apiBase';
import { API_ENDPOINTS } from '../endpoints';
import type { RecommendationOptimizeRequest, RecommendationOptimizeResponse } from '../types';

export class RecommendationService extends ApiBaseService {
  /**
   * Fetches optimal recommendation setpoints for a specific prediction ID.
   */
  static async generate(data: RecommendationOptimizeRequest): Promise<import('../types').AsyncJobResponse> {
    return this.post<import('../types').AsyncJobResponse, RecommendationOptimizeRequest>(
      API_ENDPOINTS.RECOMMENDATION.GENERATE, 
      data
    );
  }

  static async getResult(jobId: string): Promise<RecommendationOptimizeResponse> {
    return this.get<RecommendationOptimizeResponse>(
      `${API_ENDPOINTS.RECOMMENDATION.RESULT}/${jobId}`
    );
  }
}
