import React, { useState, useEffect, useRef } from 'react';

interface Prefix {
  id: string;
  prefix: string;
  cidr: string;
  rir: string;
  status: string;
  importType: 'Imported' | 'Discovered';
}

interface PrefixesTableProps {
  prefixes: Prefix[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onDelete?: (id: string) => void;
}

interface ActionMenuProps {
  prefixId: string;
  onDelete: (id: string) => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ prefixId, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleDelete = () => {
    onDelete(prefixId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="text-gray-400 hover:text-gray-600 focus:outline-none"
        aria-label="Actions"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <button
            onClick={handleDelete}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const PrefixesTable: React.FC<PrefixesTableProps> = ({ prefixes, onSelectionChange, onDelete }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showImported, setShowImported] = useState(true);
  const [showDiscovered, setShowDiscovered] = useState(false);

  const filteredPrefixes = prefixes.filter(p => {
    if (showImported && p.importType === 'Imported') return true;
    if (showDiscovered && p.importType === 'Discovered') return true;
    return false;
  });

  const importedCount = prefixes.filter(p => p.importType === 'Imported').length;
  const discoveredCount = prefixes.filter(p => p.importType === 'Discovered').length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = filteredPrefixes.map(p => p.id);
      setSelectedIds(newSelected);
      onSelectionChange?.(newSelected);
    } else {
      setSelectedIds([]);
      onSelectionChange?.([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      const newSelected = [...selectedIds, id];
      setSelectedIds(newSelected);
      onSelectionChange?.(newSelected);
    } else {
      const newSelected = selectedIds.filter(selectedId => selectedId !== id);
      setSelectedIds(newSelected);
      onSelectionChange?.(newSelected);
    }
  };

  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
    }
  };

  const handleBulkDelete = () => {
    if (onDelete && selectedIds.length > 0) {
      selectedIds.forEach(id => onDelete(id));
      setSelectedIds([]);
      onSelectionChange?.([]);
    }
  };

  const allSelected = filteredPrefixes.length > 0 && selectedIds.length === filteredPrefixes.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < filteredPrefixes.length;

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Showing prefixes:</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showImported}
              onChange={(e) => setShowImported(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Imported ({importedCount})
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showDiscovered}
              onChange={(e) => setShowDiscovered(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Discovered ({discoveredCount})
            </span>
          </label>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prefix
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPrefixes.map((prefix) => (
              <tr key={prefix.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(prefix.id)}
                    onChange={(e) => handleSelectOne(prefix.id, e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {prefix.prefix}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {prefix.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  {onDelete && <ActionMenu prefixId={prefix.id} onDelete={handleDelete} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedIds.length} Selected: {selectedIds.length}
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default PrefixesTable;

