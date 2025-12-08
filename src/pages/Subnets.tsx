import React, { useState, useEffect } from 'react';
import SearchInput from '../components/Search/SearchInput';
import Modal from '../components/Modal/Modal';
import { subnetService } from '../services';
import type { Subnet, CreateSubnetData } from '../types';

// Extended Subnet type for display with calculated utilization
interface SubnetDisplay extends Omit<Subnet, 'utilization'> {
  utilization?: number; // Override: number instead of object
  totalIPs?: number;
  usedIPs?: number;
  availableIPs?: number;
}

const Subnets: React.FC = () => {
  const [subnets, setSubnets] = useState<SubnetDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState<CreateSubnetData>({
    networkAddress: '',
    subnetMask: 24,
    ipVersion: 'IPv4',
    description: '',
    vlanId: undefined,
    location: '',
  });

  useEffect(() => {
    fetchSubnets();
  }, [searchTerm]);

  const fetchSubnets = async () => {
    try {
      setLoading(true);
      const response = await subnetService.getSubnets({
        page: 1,
        limit: 100,
        search: searchTerm || undefined,
      });

      if (response.success && response.data) {
        const subnetsData = response.data.data || [];
        // Fetch utilization for each subnet
        const subnetsWithUtilization: SubnetDisplay[] = await Promise.all(
          subnetsData.map(async (subnet): Promise<SubnetDisplay> => {
            try {
              const detailsResponse = await subnetService.getSubnetById(subnet.id);
              if (detailsResponse.success && detailsResponse.data?.utilization) {
                const util = detailsResponse.data.utilization;
                return {
                  ...subnet,
                  utilization: undefined, // Remove object
                  utilizationPercentage: parseFloat(util.utilizationPercentage),
                  totalIPs: util.totalIPs,
                  usedIPs: util.usedIPs,
                  availableIPs: util.availableIPs,
                } as SubnetDisplay;
              }
              return { ...subnet, utilization: undefined } as SubnetDisplay;
            } catch {
              return { ...subnet, utilization: undefined } as SubnetDisplay;
            }
          })
        );
        setSubnets(subnetsWithUtilization);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load subnets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubnet = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    try {
      const response = await subnetService.createSubnet(formData);
      if (response.success) {
        setShowCreateModal(false);
        setFormData({
          networkAddress: '',
          subnetMask: 24,
          ipVersion: 'IPv4',
          description: '',
          vlanId: undefined,
          location: '',
        });
        fetchSubnets();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create subnet');
    }
  };

  const handleDeleteSubnet = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subnet?')) {
      return;
    }
    try {
      const response = await subnetService.deleteSubnet(id);
      if (response.success) {
        fetchSubnets();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete subnet');
    }
  };

  const filteredSubnets = subnets.filter((subnet) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      subnet.cidr.toLowerCase().includes(searchLower) ||
      subnet.networkAddress.toLowerCase().includes(searchLower) ||
      subnet.description?.toLowerCase().includes(searchLower) ||
      subnet.location?.toLowerCase().includes(searchLower) ||
      subnet.vlanId?.toString().includes(searchTerm)
    );
  });

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return 'bg-red-500';
    if (utilization >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading && subnets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading subnets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Subnet Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Create Subnet
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder="Search by CIDR, network address, description, location, VLAN ID..."
              value={searchTerm}
              onChange={setSearchTerm}
              showResultsCount={true}
              resultsCount={filteredSubnets.length}
              totalCount={subnets.length}
            />
          </div>
        </div>
      </div>

      {/* Subnets Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CIDR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VLAN ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Count
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubnets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No subnets found. Create your first subnet to get started.
                  </td>
                </tr>
              ) : (
                filteredSubnets.map((subnet) => {
                  const utilization = subnet.utilization || 0;
                  const totalIPs = subnet.totalIPs || 0;
                  const usedIPs = subnet.usedIPs || 0;
                  return (
                    <tr key={subnet.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{subnet.cidr}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{subnet.description || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{subnet.vlanId || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{subnet.location || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getUtilizationColor(utilization)}`}
                              style={{ width: `${utilization}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-700 w-12 text-right">
                            {utilization.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {usedIPs} / {totalIPs}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteSubnet(subnet.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Subnet Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setError(''); // Clear errors when closing modal
          setFormData({
            networkAddress: '',
            subnetMask: 24,
            description: '',
            vlanId: undefined,
            location: '',
          });
        }}
        title="Create New Subnet"
      >
        <form className="space-y-4" onSubmit={handleCreateSubnet}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IP Version *
            </label>
            <select
              value={formData.ipVersion || 'IPv4'}
              onChange={(e) => {
                const ipVersion = e.target.value as 'IPv4' | 'IPv6';
                setFormData({
                  ...formData,
                  ipVersion,
                  subnetMask: ipVersion === 'IPv4' ? 24 : 64,
                  networkAddress: '',
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="IPv4">IPv4</option>
              <option value="IPv6">IPv6</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Network Address *
            </label>
            <input
              type="text"
              placeholder={formData.ipVersion === 'IPv6' ? '2001:db8::' : '192.168.1.0'}
              required
              value={formData.networkAddress}
              onChange={(e) =>
                setFormData({ ...formData, networkAddress: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subnet Mask (CIDR) *
            </label>
            <input
              type="number"
              placeholder={formData.ipVersion === 'IPv6' ? '64' : '24'}
              min="0"
              max={formData.ipVersion === 'IPv6' ? 128 : 32}
              required
              value={formData.subnetMask}
              onChange={(e) =>
                setFormData({ ...formData, subnetMask: parseInt(e.target.value) || (formData.ipVersion === 'IPv6' ? 64 : 24) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Range: 0-{formData.ipVersion === 'IPv6' ? '128' : '32'} ({formData.ipVersion === 'IPv6' ? 'IPv6' : 'IPv4'})
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              placeholder="Subnet description..."
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">VLAN ID</label>
              <input
                type="number"
                placeholder="100"
                value={formData.vlanId || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vlanId: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                placeholder="Datacenter A"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Subnet
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Subnets;
