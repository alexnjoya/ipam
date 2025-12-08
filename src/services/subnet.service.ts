import BaseApi from './baseApi';
import type { ApiResponse } from './baseApi';
import type {
  Subnet,
  SubnetListParams,
  CreateSubnetData,
  UpdateSubnetData,
  PaginatedResponse,
} from '../types';

class SubnetService extends BaseApi {
  async getSubnets(params?: SubnetListParams): Promise<ApiResponse<PaginatedResponse<Subnet>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.vlanId) queryParams.append('vlanId', params.vlanId.toString());

    return this.request<PaginatedResponse<Subnet>>(`/subnets?${queryParams.toString()}`);
  }

  async getSubnetById(id: string): Promise<ApiResponse<Subnet>> {
    return this.request<Subnet>(`/subnets/${id}`);
  }

  async createSubnet(data: CreateSubnetData): Promise<ApiResponse<Subnet>> {
    return this.request<Subnet>('/subnets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSubnet(id: string, data: UpdateSubnetData): Promise<ApiResponse<Subnet>> {
    return this.request<Subnet>(`/subnets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSubnet(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/subnets/${id}`, {
      method: 'DELETE',
    });
  }
}

export const subnetService = new SubnetService();
export default subnetService;
