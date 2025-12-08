export type IpStatus = 'AVAILABLE' | 'RESERVED' | 'ASSIGNED' | 'DHCP' | 'STATIC';

export interface IpAddress {
  id: string;
  ipAddress: string;
  subnetId: string;
  status: IpStatus;
  hostname?: string;
  macAddress?: string;
  deviceName?: string;
  assignedTo?: string;
  description?: string;
  reservedUntil?: string;
  createdAt: string;
  updatedAt: string;
  subnet?: {
    id: string;
    cidr: string;
  };
  history?: IpHistory[];
}

export interface IpHistory {
  id: string;
  ipAddressId: string;
  action: string;
  changedBy?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
}

export interface IpAddressListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: IpStatus;
  subnetId?: string;
}

export interface AssignIpAddressData {
  subnetId: string;
  ipAddress?: string;
  hostname?: string;
  macAddress?: string;
  deviceName?: string;
  assignedTo?: string;
  description?: string;
  status?: IpStatus;
}

export interface UpdateIpAddressData {
  hostname?: string;
  macAddress?: string;
  deviceName?: string;
  assignedTo?: string;
  description?: string;
  status?: IpStatus;
}

