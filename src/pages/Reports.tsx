import React, { useState, useEffect } from 'react';
import PrefixStatisticsChart from '../components/Charts/PrefixStatisticsChart';
import { reportService } from '../services';
import type { UtilizationReport, StatusReport } from '../types';
import type { ChartData } from '../types';

const Reports: React.FC = () => {
  const [exportFormat, setExportFormat] = useState<'CSV' | 'JSON'>('CSV');
  const [selectedReport, setSelectedReport] = useState<string>('utilization');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [utilizationData, setUtilizationData] = useState<UtilizationReport | null>(null);
  const [statusData, setStatusData] = useState<StatusReport | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [utilizationResponse, statusResponse] = await Promise.all([
        reportService.getUtilizationReport(),
        reportService.getStatusReport(),
      ]);

      if (utilizationResponse.success && utilizationResponse.data) {
        setUtilizationData(utilizationResponse.data);
      }

      if (statusResponse.success && statusResponse.data) {
        setStatusData(statusResponse.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const convertToCSV = (): string => {
    if (selectedReport === 'utilization' && utilizationData) {
      // CSV header
      const headers = ['CIDR', 'Total IPs', 'Used IPs', 'Reserved IPs', 'Available IPs', 'Utilization %'];
      const rows = [headers.join(',')];

      // Add subnet rows
      utilizationData.subnets.forEach((subnet) => {
        const row = [
          subnet.cidr,
          subnet.totalIPs.toString(),
          subnet.usedIPs.toString(),
          subnet.reservedIPs.toString(),
          subnet.availableIPs.toString(),
          subnet.utilizationPercentage,
        ];
        rows.push(row.join(','));
      });

      // Add totals row
      rows.push(''); // Empty row separator
      const totalsRow = [
        'TOTALS',
        utilizationData.totals.totalIPs.toString(),
        utilizationData.totals.usedIPs.toString(),
        utilizationData.totals.reservedIPs.toString(),
        utilizationData.totals.availableIPs.toString(),
        utilizationData.totals.utilizationPercentage,
      ];
      rows.push(totalsRow.join(','));

      return rows.join('\n');
    } else if (selectedReport === 'status' && statusData) {
      // CSV header
      const headers = ['Status', 'Count'];
      const rows = [headers.join(',')];

      // Add status rows
      Object.entries(statusData).forEach(([status, count]) => {
        rows.push([status, count.toString()].join(','));
      });

      return rows.join('\n');
    }
    return '';
  };

  const convertToJSON = (): string => {
    if (selectedReport === 'utilization' && utilizationData) {
      return JSON.stringify(utilizationData, null, 2);
    } else if (selectedReport === 'status' && statusData) {
      return JSON.stringify(statusData, null, 2);
    }
    return '{}';
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (exportFormat === 'CSV') {
      const csvContent = convertToCSV();
      const filename = `${selectedReport}-report-${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
    } else {
      const jsonContent = convertToJSON();
      const filename = `${selectedReport}-report-${new Date().toISOString().split('T')[0]}.json`;
      downloadFile(jsonContent, filename, 'application/json');
    }
  };

  // Transform utilization data for charts
  const utilizationChartData: ChartData[] = utilizationData
    ? [
        {
          name: 'Assigned',
          value: utilizationData.totals.usedIPs,
          percentage: parseFloat(utilizationData.totals.utilizationPercentage),
          color: '#3b82f6',
        },
        {
          name: 'Reserved',
          value: utilizationData.totals.reservedIPs,
          percentage: parseFloat(
            (
              (utilizationData.totals.reservedIPs / utilizationData.totals.totalIPs) *
              100
            ).toFixed(2)
          ),
          color: '#f59e0b',
        },
        {
          name: 'Available',
          value: utilizationData.totals.availableIPs,
          percentage: parseFloat(
            (
              (utilizationData.totals.availableIPs / utilizationData.totals.totalIPs) *
              100
            ).toFixed(2)
          ),
          color: '#10b981',
        },
      ]
    : [];


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex items-center gap-3">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'CSV' | 'JSON')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="CSV">CSV</option>
            <option value="JSON">JSON</option>
          </select>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Report Type:</span>
          <button
            onClick={() => setSelectedReport('utilization')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedReport === 'utilization'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Utilization Report
          </button>
          <button
            onClick={() => setSelectedReport('status')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedReport === 'status'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Status Report
          </button>
        </div>
      </div>

      {/* Utilization Report */}
      {selectedReport === 'utilization' && utilizationData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Subnets</h3>
              <p className="text-3xl font-bold text-gray-900">{utilizationData.subnets.length}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total IP Addresses</h3>
              <p className="text-3xl font-bold text-gray-900">
                {utilizationData.totals.totalIPs.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Overall Utilization</h3>
              <p className="text-3xl font-bold text-gray-900">
                {utilizationData.totals.utilizationPercentage}%
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Utilization by Status
            </h2>
            <PrefixStatisticsChart
              title="IP Address Status Distribution"
              total={`${utilizationData.totals.totalIPs.toLocaleString()} Total IPs`}
              data={utilizationChartData}
            />
          </div>
        </div>
      )}

      {/* Status Report */}
      {selectedReport === 'status' && statusData && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">IP Address Status Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(statusData).map(([status, count], index) => {
              const colors = [
                'bg-blue-50 text-blue-600',
                'bg-yellow-50 text-yellow-600',
                'bg-green-50 text-green-600',
                'bg-purple-50 text-purple-600',
                'bg-gray-50 text-gray-600',
              ];
              return (
                <div key={status} className={`text-center p-4 ${colors[index % colors.length]} rounded-lg`}>
                  <div className="text-2xl font-bold">{count.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 mt-1">{status}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
