import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal/Modal';
import { reservationService, subnetService } from '../services';
import type { Reservation, CreateReservationData } from '../types';
import type { Subnet } from '../types';

// Local interface for display
interface ReservationDisplay extends Omit<Reservation, 'subnet'> {
  subnet: string;
}

const Reservations: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationDisplay[]>([]);
  const [subnets, setSubnets] = useState<Subnet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<CreateReservationData>({
    subnetId: '',
    startIp: '',
    endIp: '',
    purpose: '',
    reservedBy: '',
    expiresAt: undefined,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reservationsResponse, subnetsResponse] = await Promise.all([
        reservationService.getReservations({
          search: searchTerm || undefined,
        }),
        subnetService.getSubnets({ page: 1, limit: 100 }),
      ]);

      if (reservationsResponse.success && reservationsResponse.data) {
        const displayReservations: ReservationDisplay[] = reservationsResponse.data.map((res) => ({
          ...res,
          subnet: res.subnet?.cidr || 'Unknown',
        }));
        setReservations(displayReservations);
      }

      if (subnetsResponse.success && subnetsResponse.data) {
        setSubnets(subnetsResponse.data.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await reservationService.createReservation(formData);
      if (response.success) {
        setShowCreateModal(false);
        setFormData({
          subnetId: '',
          startIp: '',
          endIp: '',
          purpose: '',
          reservedBy: '',
          expiresAt: undefined,
        });
        fetchData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create reservation');
    }
  };

  const handleDeleteReservation = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this reservation?')) {
      return;
    }
    try {
      const response = await reservationService.deleteReservation(id);
      if (response.success) {
        fetchData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete reservation');
    }
  };

  const filteredReservations = reservations.filter(
    (res) =>
      res.subnet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.startIp.includes(searchTerm) ||
      res.endIp.includes(searchTerm) ||
      res.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.reservedBy?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading && reservations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">IP Range Reservations</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
        >
          + Create Reservation
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <input
          type="text"
          placeholder="Search by subnet, IP range, purpose, or reserved by..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subnet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reserved By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No reservations found.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{reservation.subnet}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {reservation.startIp} - {reservation.endIp}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{reservation.purpose || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{reservation.reservedBy || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {reservation.expiresAt || 'No expiration'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isExpired(reservation.expiresAt) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteReservation(reservation.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Reservation Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({
            subnetId: '',
            startIp: '',
            endIp: '',
            purpose: '',
            reservedBy: '',
            expiresAt: undefined,
          });
        }}
        title="Create IP Range Reservation"
      >
        <form className="space-y-4" onSubmit={handleCreateReservation}>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start IP *</label>
              <input
                type="text"
                placeholder="192.168.1.100"
                required
                value={formData.startIp}
                onChange={(e) => setFormData({ ...formData, startIp: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End IP *</label>
              <input
                type="text"
                placeholder="192.168.1.150"
                required
                value={formData.endIp}
                onChange={(e) => setFormData({ ...formData, endIp: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
            <textarea
              placeholder="Reason for reservation..."
              rows={3}
              value={formData.purpose || ''}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reserved By</label>
            <input
              type="text"
              placeholder="Team or user name"
              value={formData.reservedBy || ''}
              onChange={(e) => setFormData({ ...formData, reservedBy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiration Date (optional)
            </label>
            <input
              type="datetime-local"
              value={formData.expiresAt || ''}
              onChange={(e) =>
                setFormData({ ...formData, expiresAt: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
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
              Create Reservation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Reservations;
