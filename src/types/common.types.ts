export interface ChartData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface PrefixTableItem {
  id: string;
  prefix: string;
  cidr: string;
  rir: string;
  status: string;
  importType: 'Imported' | 'Discovered';
}

