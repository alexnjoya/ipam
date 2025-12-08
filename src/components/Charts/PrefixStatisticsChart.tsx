import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { ChartData } from '../../types';

interface PrefixStatisticsChartProps {
  title: string;
  total: string;
  data: ChartData[];
}

const PrefixStatisticsChart: React.FC<PrefixStatisticsChartProps> = ({ title, total, data }) => {
  // Filter out zero values and ensure we have valid data
  const validData = data.filter(item => item.value > 0);
  const hasData = validData.length > 0;

  if (!hasData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
        </div>
        <div className="flex items-center justify-center h-48 text-gray-500">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={validData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={(entry: any) => `${entry.percentage}%`}
              >
                {validData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => value.toLocaleString()}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex-1 space-y-3">
          {validData.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-700">{item.name}</div>
                <div className="text-xs text-gray-500">
                  {item.value.toLocaleString()} IPs ({item.percentage.toFixed(1)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrefixStatisticsChart;

