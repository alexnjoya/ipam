export interface Reservation {
  id: string;
  subnetId: string;
  startIp: string;
  endIp: string;
  purpose?: string;
  reservedBy?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  subnet?: {
    id: string;
    cidr: string;
  };
}

export interface ReservationListParams {
  subnetId?: string;
  search?: string;
}

export interface CreateReservationData {
  subnetId: string;
  startIp: string;
  endIp: string;
  purpose?: string;
  reservedBy?: string;
  expiresAt?: string;
}

export interface UpdateReservationData {
  startIp?: string;
  endIp?: string;
  purpose?: string;
  reservedBy?: string;
  expiresAt?: string;
}

