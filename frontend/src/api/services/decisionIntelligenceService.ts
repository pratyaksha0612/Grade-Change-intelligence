import { ApiBaseService } from '../../services/apiBase';
import { API_ENDPOINTS } from '../endpoints';

export interface DecisionIntelligenceRequest {
  transitionId: string;
}

export interface DecisionIntelligenceResponse {
  decision: any;
}

export class DecisionIntelligenceService extends ApiBaseService {
  /**
   * Fetches the final fused AI decision for a grade transition.
   */
  static async getDecision(data: DecisionIntelligenceRequest): Promise<DecisionIntelligenceResponse> {
    return this.post<DecisionIntelligenceResponse, DecisionIntelligenceRequest>(
      API_ENDPOINTS.DECISION_INTELLIGENCE?.ASSESSMENT || '/decision/assessment', 
      data
    );
  }
}
