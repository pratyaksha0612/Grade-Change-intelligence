import { ApiBaseService } from '../../services/apiBase';
import { API_ENDPOINTS } from '../endpoints';

export interface SettingsResponse {
  data: any;
}

export class SettingsService extends ApiBaseService {
  /**
   * Fetches global application and system configuration settings.
   */
  static async getSettings(): Promise<SettingsResponse> {
    return this.get<SettingsResponse>(
      API_ENDPOINTS.SETTINGS?.CONFIG || '/settings/config'
    );
  }
}
