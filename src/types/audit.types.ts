export interface AuditLog {
  id: string;
  ipAddressId: string;
  action: string;
  changedBy?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
  ipAddress?: {
    id: string;
    ipAddress: string;
    subnet?: {
      cidr: string;
    };
  };
}

export interface AuditLogListParams {
  page?: number;
  limit?: number;
  action?: string;
  ipAddressId?: string;
  search?: string;
}

