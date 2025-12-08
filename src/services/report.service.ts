import BaseApi from './baseApi';
import type { ApiResponse } from './baseApi';
import type { UtilizationReport, StatusReport } from '../types';

class ReportService extends BaseApi {
  async getUtilizationReport(): Promise<ApiResponse<UtilizationReport>> {
    return this.request<UtilizationReport>('/reports/utilization');
  }

  async getStatusReport(): Promise<ApiResponse<StatusReport>> {
    return this.request<StatusReport>('/reports/status');
  }
}

export const reportService = new ReportService();
export default reportService;
