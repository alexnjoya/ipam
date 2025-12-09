import React, { useState, useEffect } from 'react';
import { auditService } from '../services';
import type { AuditLog } from '../types';

type ActionType = 'created' | 'assigned' | 'released' | 'updated' | 'deleted';

const Audit: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<ActionType | 'ALL'>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter, dateFilter]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      const response = await auditService.getAuditLogs({
        page: 1,
        limit: 100,
        action: actionFilter !== 'ALL' ? actionFilter : undefined,
        search: searchTerm || undefined,
      });

      if (response.success && response.data) {
        let logs = response.data.data || [];
        
        // Filter by date if provided
        if (dateFilter) {
          logs = logs.filter((log) => {
            const logDate = new Date(log.timestamp).toISOString().split('T')[0];
            return logDate === dateFilter;
          });
        }
        
        setAuditLogs(logs);
      } else {
        setError(response.error || 'Failed to load audit logs');
        setAuditLogs([]);
      }
    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
      setError(err.message || 'Failed to load audit logs');
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      (log.ipAddress?.ipAddress || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.changedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getActionBadge = (action: string) => {
    const styles: Record<string, string> = {
      created: 'bg-green-100 text-green-800',
      assigned: 'bg-blue-100 text-blue-800',
      released: 'bg-yellow-100 text-yellow-800',
      updated: 'bg-purple-100 text-purple-800',
      deleted: 'bg-red-100 text-red-800',
    };
    return styles[action.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading && auditLogs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Audit & History</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by IP address, user, or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as ActionType | 'ALL')}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          >
            <option value="ALL">All Actions</option>
            <option value="created">Created</option>
            <option value="assigned">Assigned</option>
            <option value="released">Released</option>
            <option value="updated">Updated</option>
            <option value="deleted">Deleted</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address / Subnet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Changed By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Changes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatTimestamp(log.timestamp)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getActionBadge(log.action)}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 font-mono">
                        {log.ipAddress?.ipAddress || 'N/A'}
                      </div>
                      {log.ipAddress?.subnet?.cidr && (
                        <div className="text-xs text-gray-500">{log.ipAddress.subnet.cidr}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{log.changedBy || 'System'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {log.oldValue && log.newValue ? (
                        <div className="text-xs text-gray-500">
                          <span className="line-through text-red-600">
                            {JSON.stringify(log.oldValue).substring(0, 50)}
                          </span>
                          <span className="mx-2">→</span>
                          <span className="text-green-600">
                            {JSON.stringify(log.newValue).substring(0, 50)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Audit;
