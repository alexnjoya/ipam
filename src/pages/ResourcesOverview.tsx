import React, { useState } from 'react';
import PrefixStatisticsChart from '../components/Charts/PrefixStatisticsChart';
import PrefixesTable from '../components/Prefixes/PrefixesTable';

// Mock data - replace with API calls later
const mockIpv4Data = [
  { name: 'Discovered', value: 2804480, percentage: 93.99, color: '#10b981' },
  { name: 'Imported', value: 2304, percentage: 6.01, color: '#f59e0b' },
];

const mockIpv6Data = [
  { name: 'Discovered', value: 268435456, percentage: 99.99, color: '#10b981' },
  { name: 'Imported', value: 1, percentage: 0.01, color: '#f59e0b' },
];

const mockPrefixes = [
  { id: '1', prefix: '10.0.164.0/24', cidr: '/24', rir: 'RIPE', status: 'Available', importType: 'Imported' as const },
  { id: '2', prefix: '10.0.165.0/24', cidr: '/24', rir: 'RIPE', status: 'Available', importType: 'Imported' as const },
  { id: '3', prefix: '10.0.166.0/24', cidr: '/24', rir: 'ARIN', status: 'Available', importType: 'Imported' as const },
  { id: '4', prefix: '10.0.167.0/24', cidr: '/24', rir: 'RIPE', status: 'Available', importType: 'Imported' as const },
  { id: '5', prefix: '10.0.168.0/24', cidr: '/24', rir: 'APNIC', status: 'Available', importType: 'Imported' as const },
  { id: '6', prefix: '192.168.1.0/24', cidr: '/24', rir: 'RIPE', status: 'Available', importType: 'Discovered' as const },
  { id: '7', prefix: '192.168.2.0/24', cidr: '/24', rir: 'ARIN', status: 'Available', importType: 'Discovered' as const },
];

const ResourcesOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Organizations' | 'Prefixes'>('Prefixes');
  const [_selectedPrefixIds, setSelectedPrefixIds] = useState<string[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Resources Overview</h1>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('Organizations')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'Organizations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Organizations
          </button>
          <button
            onClick={() => setActiveTab('Prefixes')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'Prefixes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Prefixes
          </button>
        </nav>
      </div>

      {activeTab === 'Prefixes' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Prefixes based on resource import type
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PrefixStatisticsChart
                title="IPv4"
                total="+2.80M Total IPv4"
                data={mockIpv4Data}
              />
              <PrefixStatisticsChart
                title="IPv6"
                total="+268M Total IPv6 in /48"
                data={mockIpv6Data}
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resources</h2>
            <PrefixesTable
              prefixes={mockPrefixes}
              onSelectionChange={setSelectedPrefixIds}
            />
          </div>
        </div>
      )}

      {activeTab === 'Organizations' && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Organizations view coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default ResourcesOverview;

