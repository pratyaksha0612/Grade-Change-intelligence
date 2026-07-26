import { ApiBaseService } from '../../services/apiBase';
import { API_ENDPOINTS } from '../endpoints';
import type { DigitalTwinSimulateRequest, DigitalTwinSimulateResponse } from '../types';

export class DigitalTwinService extends ApiBaseService {
  /**
   * Fetches physics-informed simulation trajectory for a specific set of recommended setpoints.
   */
  static async simulate(data: DigitalTwinSimulateRequest): Promise<import('../types').AsyncJobResponse> {
    return this.post<import('../types').AsyncJobResponse, DigitalTwinSimulateRequest>(
      API_ENDPOINTS.DIGITAL_TWIN.SIMULATE, 
      data
    );
  }

  static async getResult(jobId: string): Promise<DigitalTwinSimulateResponse> {
    return this.get<DigitalTwinSimulateResponse>(
      `${API_ENDPOINTS.DIGITAL_TWIN.RESULT}/${jobId}`
    );
  }
}
