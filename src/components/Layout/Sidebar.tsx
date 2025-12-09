import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

// Icon components
const DashboardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const SubnetsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const IpAddressesIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
  </svg>
);

const ReservationsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const ReportsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const AuditIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const AccountIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed: externalCollapsed,
  onToggleCollapse,
  isMobileMenuOpen = false,
  onMobileMenuClose
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(newState);
      localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    }
  };

  useEffect(() => {
    if (externalCollapsed === undefined) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(internalCollapsed));
    }
  }, [internalCollapsed, externalCollapsed]);

  const menuItems = [
    { label: "Dashboard", Icon: DashboardIcon, path: "/" },
    { label: "Subnets", Icon: SubnetsIcon, path: "/subnets" },
    { label: "IP Addresses", Icon: IpAddressesIcon, path: "/ip-addresses" },
    { label: "Reservations", Icon: ReservationsIcon, path: "/reservations" },
    { label: "Reports & Analytics", Icon: ReportsIcon, path: "/reports" },
    { label: "Audit & History", Icon: AuditIcon, path: "/audit" },
    { label: "Settings", Icon: SettingsIcon, path: "/settings" },
    { label: "Account", Icon: AccountIcon, path: "/account" },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <div className={`
        lg:hidden
        fixed
        left-0
        top-0
        h-screen
        w-64
        bg-gray-50
        border-r
        border-gray-200
        z-50
        transform
        transition-transform
        duration-300
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile Branding */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-gray-900">BRANDER GROUP</div>
            <button 
              onClick={onMobileMenuClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close menu"
            >
              <svg 
                className="w-5 h-5 text-gray-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <nav className="p-2 mt-1 space-y-0.5 overflow-y-auto h-[calc(100vh-73px)]">
          {menuItems.map((item, index) => {
            const active = isActive(item.path);
            return (
              <div
                key={index}
                onClick={() => {
                  navigate(item.path);
                  onMobileMenuClose?.();
                }}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${active ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <item.Icon className={`w-5 h-5 ${active ? 'text-blue-700' : 'text-gray-600'}`} />
                  </div>
                  <span className={`text-sm font-medium ${active ? 'text-blue-700' : ''}`}>
                    {item.label}
                  </span>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <div className={`
        hidden
        lg:block
        ${isCollapsed ? 'w-20' : 'w-64'} 
        bg-gray-50 
        border-r 
        border-gray-200 
        h-screen 
        fixed 
        left-0 
        top-0 
        overflow-hidden 
        transition-all 
        duration-300
        z-30
      `}>
      {/* Branding Section */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="text-lg font-bold text-gray-900">BRANDER GROUP</div>
          )}
          {isCollapsed && <div className="flex-1" />}
          <button 
            onClick={toggleCollapse}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg 
              className={`w-5 h-5 text-gray-600 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="p-2 mt-1 space-y-0.5">
        {menuItems.map((item, index) => {
          const active = isActive(item.path);
          return (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-1.5 rounded-lg cursor-pointer transition-colors group ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                <div className={`p-2 rounded-full ${active ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'} transition-colors`}>
                  <item.Icon className={`w-5 h-5 ${active ? 'text-blue-700' : 'text-gray-600'}`} />
                </div>
                {!isCollapsed && (
                  <span className={`text-sm font-medium ${active ? 'text-blue-700' : 'group-hover:text-gray-900'}`}>
                    {item.label}
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          );
        })}
      </nav>
      </div>
    </>
  );
};

export default Sidebar;

