import { ApiBaseService } from '../../services/apiBase';
import { API_ENDPOINTS } from '../endpoints';

export interface TimelineEventRequest {
  transitionId: string;
}

export interface TimelineEventResponse {
  // Define response structure based on backend spec
  events: any[];
}

export class TimelineService extends ApiBaseService {
  /**
   * Fetches the chronological timeline for a specific transition.
   */
  static async getEvents(data: TimelineEventRequest): Promise<TimelineEventResponse> {
    return this.post<TimelineEventResponse, TimelineEventRequest>(
      API_ENDPOINTS.TIMELINE.EVENTS, 
      data
    );
  }
}
