import React, { useState, useEffect } from 'react';
import PrefixStatisticsChart from '../components/Charts/PrefixStatisticsChart';
import PrefixesTable from '../components/Prefixes/PrefixesTable';
import Loading from '../components/Loading';
import Modal from '../components/Modal/Modal';
import { subnetService, reportService } from '../services';
import type { Subnet } from '../types';

const Dashboard: React.FC = () => {
  // const [selectedPrefixIds, setSelectedPrefixIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subnets, setSubnets] = useState<Subnet[]>([]);
  const [utilizationData, setUtilizationData] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subnetToDelete, setSubnetToDelete] = useState<{ id: string; cidr: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subnetsResponse, utilizationResponse] = await Promise.all([
        subnetService.getSubnets({ page: 1, limit: 100 }),
        reportService.getUtilizationReport(),
      ]);

      if (subnetsResponse.success && subnetsResponse.data) {
        setSubnets(subnetsResponse.data.data || []);
      }

      if (utilizationResponse.success && utilizationResponse.data) {
        setUtilizationData(utilizationResponse.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    const subnet = subnets.find(s => s.id === id);
    if (subnet) {
      setSubnetToDelete({ id: subnet.id, cidr: subnet.cidr });
      setDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!subnetToDelete) return;

    try {
      setDeleting(true);
      const response = await subnetService.deleteSubnet(subnetToDelete.id);
      if (response.success) {
        setDeleteModalOpen(false);
        setSubnetToDelete(null);
        // Refresh data
        await fetchData();
      } else {
        setError('Failed to delete subnet');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete subnet');
    } finally {
      setDeleting(false);
    }
  };

  // Transform subnets for PrefixesTable
  const prefixData = subnets.map((subnet) => ({
    id: subnet.id,
    prefix: subnet.cidr,
    cidr: `/${subnet.subnetMask}`,
    rir: 'N/A',
    status: 'Available',
    importType: 'Imported' as const,
  }));

  // Calculate utilization stats
  const totalIPs = utilizationData?.totals?.totalIPs || 0;
  const usedIPs = utilizationData?.totals?.usedIPs || 0;
  const availableIPs = utilizationData?.totals?.availableIPs || 0;

  const ipv4Data = [
    {
      name: 'Used',
      value: usedIPs,
      percentage: totalIPs > 0 ? parseFloat(((usedIPs / totalIPs) * 100).toFixed(2)) : 0,
      color: '#3b82f6',
    },
    {
      name: 'Available',
      value: availableIPs,
      percentage: totalIPs > 0 ? parseFloat(((availableIPs / totalIPs) * 100).toFixed(2)) : 0,
      color: '#10b981',
    },
  ];

  if (loading) {
    return <Loading message="Loading dashboard..." />;
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
        <h1 className="text-2xl font-bold text-gray-900">IPAM Dashboard</h1>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Subnet Utilization Overview
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {totalIPs > 0 && ipv4Data.length > 0 ? (
              <PrefixStatisticsChart
                title="IPv4 Utilization"
                total={`${totalIPs.toLocaleString()} Total IPs`}
                data={ipv4Data}
              />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">IPv4 Utilization</h3>
                <p className="text-gray-500">No IP data available yet</p>
              </div>
            )}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Subnets</h3>
              <p className="text-3xl font-bold text-gray-900">{subnets.length.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Subnets</h2>
          {subnets.length > 0 ? (
            <PrefixesTable
              prefixes={prefixData}
              onDelete={handleDeleteClick}
            />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No subnets found. Create your first subnet to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteModalOpen(false);
            setSubnetToDelete(null);
          }
        }}
        title="Delete Subnet"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete the subnet <strong>{subnetToDelete?.cidr}</strong>?
          </p>
          <p className="text-sm text-gray-500">
            This action cannot be undone. All associated IP addresses will also be removed.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setDeleteModalOpen(false);
                setSubnetToDelete(null);
              }}
              disabled={deleting}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
