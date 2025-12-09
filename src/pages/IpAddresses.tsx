import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal/Modal';
import { ipAddressService, subnetService } from '../services';
import type { IpStatus, IpAddress, AssignIpAddressData, UpdateIpAddressData } from '../types';
import type { Subnet } from '../types';

// Local interface for display (includes subnet as string for UI)
interface IpAddressDisplay extends Omit<IpAddress, 'subnet'> {
  subnet: string;
}

const IpAddresses: React.FC = () => {
  const [ipAddresses, setIpAddresses] = useState<IpAddressDisplay[]>([]);
  const [subnets, setSubnets] = useState<Subnet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<IpStatus | 'ALL'>('ALL');
  const [subnetFilter, setSubnetFilter] = useState<string>('ALL');
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState<AssignIpAddressData>({
    subnetId: '',
    ipAddress: undefined,
    hostname: '',
    macAddress: '',
    deviceName: '',
    assignedTo: '',
    description: '',
    status: 'ASSIGNED',
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter, subnetFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ipsResponse, subnetsResponse] = await Promise.all([
        ipAddressService.getIpAddresses({
          page: 1,
          limit: 100,
          search: searchTerm || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          subnetId: subnetFilter !== 'ALL' ? subnetFilter : undefined,
        }),
        subnetService.getSubnets({ page: 1, limit: 100 }),
      ]);

      if (ipsResponse.success && ipsResponse.data) {
        const ips = ipsResponse.data.data || [];
        const displayIps: IpAddressDisplay[] = ips.map((ip) => ({
          ...ip,
          subnet: ip.subnet?.cidr || 'Unknown',
        }));
        setIpAddresses(displayIps);
      }

      if (subnetsResponse.success && subnetsResponse.data) {
        setSubnets(subnetsResponse.data.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load IP addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignIp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await ipAddressService.assignIpAddress(formData);
      if (response.success) {
        setShowAssignModal(false);
        setFormData({
          subnetId: '',
          ipAddress: undefined,
          hostname: '',
          macAddress: '',
          deviceName: '',
          assignedTo: '',
          description: '',
          status: 'ASSIGNED',
        });
        fetchData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to assign IP address');
    }
  };

  const handleReleaseIp = async (id: string) => {
    if (!window.confirm('Are you sure you want to release this IP address?')) {
      return;
    }
    try {
      const response = await ipAddressService.releaseIpAddress(id);
      if (response.success) {
        fetchData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to release IP address');
    }
  };

  const filteredAddresses = ipAddresses.filter((ip) => {
    const matchesSearch =
      ip.ipAddress.includes(searchTerm) ||
      ip.hostname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ip.macAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ip.deviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ip.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getStatusBadge = (status: IpStatus) => {
    const styles = {
      AVAILABLE: 'bg-green-100 text-green-800',
      RESERVED: 'bg-yellow-100 text-yellow-800',
      ASSIGNED: 'bg-blue-100 text-blue-800',
      DHCP: 'bg-purple-100 text-purple-800',
      STATIC: 'bg-gray-100 text-gray-800',
    };
    return styles[status];
  };

  const uniqueSubnets = Array.from(new Set(ipAddresses.map((ip) => ip.subnet)));

  if (loading && ipAddresses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading IP addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">IP Address Management</h1>
        <button
          onClick={() => setShowAssignModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Assign IP Address
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
            <input
              type="text"
              placeholder="Search by IP, hostname, MAC address, device name, or assigned to..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as IpStatus | 'ALL')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="RESERVED">Reserved</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="DHCP">DHCP</option>
            <option value="STATIC">Static</option>
          </select>
          <select
            value={subnetFilter}
            onChange={(e) => setSubnetFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Subnets</option>
            {uniqueSubnets.map((subnet) => (
              <option key={subnet} value={subnet}>
                {subnet}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* IP Addresses Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subnet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hostname
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MAC Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAddresses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No IP addresses found.
                  </td>
                </tr>
              ) : (
                filteredAddresses.map((ip) => (
                  <tr key={ip.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ip.ipAddress}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{ip.subnet}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(ip.status)}`}
                      >
                        {ip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{ip.hostname || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">{ip.macAddress || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{ip.deviceName || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{ip.assignedTo || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {ip.status === 'AVAILABLE' ? (
                        <button
                          onClick={() => {
                            setFormData({ ...formData, subnetId: ip.subnetId });
                            setShowAssignModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Assign
                        </button>
                      ) : (
                        <>
                          <button className="text-gray-600 hover:text-gray-900 mr-4">Edit</button>
                          <button
                            onClick={() => handleReleaseIp(ip.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Release
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign IP Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setFormData({
            subnetId: '',
            ipAddress: undefined,
            hostname: '',
            macAddress: '',
            deviceName: '',
            assignedTo: '',
            description: '',
            status: 'ASSIGNED',
          });
        }}
        title="Assign IP Address"
      >
        <form className="space-y-4" onSubmit={handleAssignIp}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subnet *</label>
            <select
              required
              value={formData.subnetId}
              onChange={(e) => setFormData({ ...formData, subnetId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a subnet</option>
              {subnets.map((subnet) => (
                <option key={subnet.id} value={subnet.id}>
                  {subnet.cidr}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IP Address (optional - leave blank for automatic assignment)
            </label>
            <input
              type="text"
              placeholder="192.168.1.50"
              value={formData.ipAddress || ''}
              onChange={(e) =>
                setFormData({ ...formData, ipAddress: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hostname</label>
            <input
              type="text"
              placeholder="server.example.com"
              value={formData.hostname || ''}
              onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">MAC Address</label>
            <input
              type="text"
              placeholder="00:1B:44:11:3A:B7"
              value={formData.macAddress || ''}
              onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
            <input
              type="text"
              placeholder="Web Server"
              value={formData.deviceName || ''}
              onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
            <input
              type="text"
              placeholder="John Doe"
              value={formData.assignedTo || ''}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              placeholder="Additional notes..."
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as IpStatus })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ASSIGNED">Assigned</option>
              <option value="RESERVED">Reserved</option>
              <option value="DHCP">DHCP</option>
              <option value="STATIC">Static</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAssignModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Assign IP
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default IpAddresses;
