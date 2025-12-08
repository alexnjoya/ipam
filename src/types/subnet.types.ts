export interface Subnet {
  id: string;
  networkAddress: string;
  subnetMask: number;
  cidr: string;
  description?: string;
  vlanId?: number;
  location?: string;
  parentSubnetId?: string;
  createdAt: string;
  updatedAt: string;
  utilization?: {
    totalIPs: number;
    usedIPs: number;
    reservedIPs: number;
    availableIPs: number;
    utilizationPercentage: string;
  };
}

export interface SubnetListParams {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  vlanId?: number;
}

export interface CreateSubnetData {
  networkAddress: string;
  subnetMask: number;
  description?: string;
  vlanId?: number;
  location?: string;
  parentSubnetId?: string;
}

export interface UpdateSubnetData {
  networkAddress?: string;
  subnetMask?: number;
  description?: string;
  vlanId?: number;
  location?: string;
  parentSubnetId?: string;
}

