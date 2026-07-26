import { ApiBaseService } from '../../services/apiBase';
import { API_ENDPOINTS } from '../endpoints';

export interface ExplainabilityRequest {
  decisionId: string;
}

export interface ExplainabilityResponse {
  audit: any;
}

export class ExplainabilityService extends ApiBaseService {
  /**
   * Fetches the complete cryptographic audit trail and reasoning chain for an AI decision.
   */
  static async getAudit(data: ExplainabilityRequest): Promise<ExplainabilityResponse> {
    return this.post<ExplainabilityResponse, ExplainabilityRequest>(
      API_ENDPOINTS.EXPLAINABILITY?.AUDIT || '/explainability/audit', 
      data
    );
  }
}
