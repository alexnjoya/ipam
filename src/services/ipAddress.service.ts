import BaseApi from './baseApi';
import type { ApiResponse } from './baseApi';
import type {
  IpAddress,
  IpAddressListParams,
  AssignIpAddressData,
  UpdateIpAddressData,
  PaginatedResponse,
} from '../types';

class IpAddressService extends BaseApi {
  async getIpAddresses(
    params?: IpAddressListParams
  ): Promise<ApiResponse<PaginatedResponse<IpAddress>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.subnetId) queryParams.append('subnetId', params.subnetId);

    return this.request<PaginatedResponse<IpAddress>>(`/ip-addresses?${queryParams.toString()}`);
  }

  async getIpAddressById(id: string): Promise<ApiResponse<IpAddress>> {
    return this.request<IpAddress>(`/ip-addresses/${id}`);
  }

  async assignIpAddress(data: AssignIpAddressData): Promise<ApiResponse<IpAddress>> {
    return this.request<IpAddress>('/ip-addresses/assign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateIpAddress(id: string, data: UpdateIpAddressData): Promise<ApiResponse<IpAddress>> {
    return this.request<IpAddress>(`/ip-addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async releaseIpAddress(id: string): Promise<ApiResponse<IpAddress>> {
    return this.request<IpAddress>(`/ip-addresses/${id}/release`, {
      method: 'POST',
    });
  }
}

export const ipAddressService = new IpAddressService();
export default ipAddressService;
