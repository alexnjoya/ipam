export interface UtilizationItem {
  subnetId: string;
  cidr: string;
  totalIPs: number;
  usedIPs: number;
  reservedIPs: number;
  availableIPs: number;
  utilizationPercentage: string;
}

export interface UtilizationReport {
  subnets: UtilizationItem[];
  totals: {
    totalIPs: number;
    usedIPs: number;
    reservedIPs: number;
    availableIPs: number;
    utilizationPercentage: string;
  };
}

export interface StatusReport {
  [status: string]: number;
}

