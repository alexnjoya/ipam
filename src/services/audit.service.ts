import BaseApi from './baseApi';
import type { ApiResponse } from './baseApi';
import type { AuditLog, AuditLogListParams, PaginatedResponse } from '../types';

class AuditService extends BaseApi {
  async getAuditLogs(
    params?: AuditLogListParams
  ): Promise<ApiResponse<PaginatedResponse<AuditLog>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.action) queryParams.append('action', params.action);
    if (params?.ipAddressId) queryParams.append('ipAddressId', params.ipAddressId);
    if (params?.search) queryParams.append('search', params.search);

    return this.request<PaginatedResponse<AuditLog>>(`/audit?${queryParams.toString()}`);
  }

  async getAuditLogById(id: string): Promise<ApiResponse<AuditLog>> {
    return this.request<AuditLog>(`/audit/${id}`);
  }
}

export const auditService = new AuditService();
export default auditService;
