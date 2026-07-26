import { ApiBaseService } from '../../services/apiBase';
import { API_ENDPOINTS } from '../endpoints';

export interface KnowledgeBaseRequest {
  recipeId?: string;
}

export interface KnowledgeBaseResponse {
  data: any;
}

export class KnowledgeBaseService extends ApiBaseService {
  /**
   * Fetches the centralized engineering truth and process constraints.
   */
  static async getWorkspaceData(data?: KnowledgeBaseRequest): Promise<KnowledgeBaseResponse> {
    return this.post<KnowledgeBaseResponse, KnowledgeBaseRequest>(
      API_ENDPOINTS.KNOWLEDGE_BASE?.SUMMARY || '/knowledge/summary', 
      data || {}
    );
  }
}
