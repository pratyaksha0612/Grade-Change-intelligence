import { ApiBaseService } from '../../services/apiBase';
import { API_ENDPOINTS } from '../endpoints';
import type { PredictionForecastRequest, PredictionForecastResponse } from '../types';

export class PredictionService extends ApiBaseService {
  /**
   * Fetches the predicted trajectory for a given grade transition.
   */
  static async getForecast(data: PredictionForecastRequest): Promise<import('../types').AsyncJobResponse> {
    return this.post<import('../types').AsyncJobResponse, PredictionForecastRequest>(
      API_ENDPOINTS.PREDICTION.FORECAST, 
      data
    );
  }

  static async getResult(jobId: string): Promise<PredictionForecastResponse> {
    return this.get<PredictionForecastResponse>(
      `${API_ENDPOINTS.PREDICTION.RESULT}/${jobId}`
    );
  }

  /**
   * Checks the health/status of the prediction engine.
   */
  static async getStatus(): Promise<{ status: string; latency: number }> {
    return this.get<{ status: string; latency: number }>(
      API_ENDPOINTS.PREDICTION.STATUS
    );
  }
}
