import BaseApi from './baseApi';
import type { ApiResponse } from './baseApi';
import type {
  Reservation,
  ReservationListParams,
  CreateReservationData,
  UpdateReservationData,
} from '../types';

class ReservationService extends BaseApi {
  async getReservations(
    params?: ReservationListParams
  ): Promise<ApiResponse<Reservation[]>> {
    const queryParams = new URLSearchParams();
    if (params?.subnetId) queryParams.append('subnetId', params.subnetId);
    if (params?.search) queryParams.append('search', params.search);

    return this.request<Reservation[]>(`/reservations?${queryParams.toString()}`);
  }

  async getReservationById(id: string): Promise<ApiResponse<Reservation>> {
    return this.request<Reservation>(`/reservations/${id}`);
  }

  async createReservation(data: CreateReservationData): Promise<ApiResponse<Reservation>> {
    return this.request<Reservation>('/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReservation(
    id: string,
    data: UpdateReservationData
  ): Promise<ApiResponse<Reservation>> {
    return this.request<Reservation>(`/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteReservation(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/reservations/${id}`, {
      method: 'DELETE',
    });
  }
}

export const reservationService = new ReservationService();
export default reservationService;
