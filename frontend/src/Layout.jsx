import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  LayoutDashboard,
  FileText,
  Search,
  Upload,
  Settings,
  LogOut,
  Layers,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, url: createPageUrl('Dashboard') },
  { name: 'Documents', icon: FileText, url: createPageUrl('Documents') },
  { name: 'Query', icon: Search, url: createPageUrl('Query') },
  { name: 'Upload', icon: Upload, url: createPageUrl('Upload') },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const username = localStorage.getItem('arcaive_username') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('arcaive_auth');
    localStorage.removeItem('arcaive_token');
    localStorage.removeItem('arcaive_username');
    navigate('/');
  };

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className="flex-shrink-0 flex flex-col border-r border-gray-200 bg-gray-50 transition-all duration-300 ease-in-out overflow-hidden"
      style={{ width: expanded ? 240 : 64 }}
    >
      {/* Logo */}
      <Link
        to={createPageUrl('Dashboard')}
        className="flex items-center gap-3 border-b border-gray-200 transition-all"
        style={{ padding: expanded ? '16px 16px' : '16px 0', justifyContent: expanded ? 'flex-start' : 'center' }}
      >
        <div className="w-8 h-8 brand-gradient rounded-lg flex items-center justify-center flex-shrink-0">
          <Layers className="w-4 h-4 text-white" />
        </div>
        {expanded && (
          <div className="overflow-hidden">
            <div className="font-serif text-lg font-semibold text-gray-900 leading-tight">Arcaive</div>
            <div className="font-mono text-[8px] text-gray-400 uppercase tracking-wider">Document Intelligence</div>
          </div>
        )}
      </Link>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-1 transition-all" style={{ padding: expanded ? '12px 10px' : '12px 8px' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <Link
              key={item.name}
              to={item.url}
              className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-brand-blue'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
              style={{
                padding: expanded ? '10px 12px' : '10px 0',
                justifyContent: expanded ? 'flex-start' : 'center',
              }}
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {expanded && <span className="whitespace-nowrap">{item.name}</span>}
            </Link>
          );
        })}

        <div className="flex-1" />

        {/* Settings */}
        <div
          className="flex items-center gap-3 rounded-lg text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer transition-all"
          style={{
            padding: expanded ? '10px 12px' : '10px 0',
            justifyContent: expanded ? 'flex-start' : 'center',
          }}
        >
          <Settings className="w-[18px] h-[18px] flex-shrink-0" />
          {expanded && <span className="whitespace-nowrap">Settings</span>}
        </div>
      </nav>

      {/* User + Logout */}
      <div className="border-t border-gray-200 transition-all" style={{ padding: expanded ? '12px 14px' : '12px 0' }}>
        <div className="flex items-center gap-3 mb-2" style={{ justifyContent: expanded ? 'flex-start' : 'center' }}>
          <div className="w-7 h-7 brand-gradient rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {username[0]?.toUpperCase()}
          </div>
          {expanded && (
            <div className="overflow-hidden">
              <div className="text-sm font-medium text-gray-900 whitespace-nowrap">{username}</div>
              <div className="text-xs text-gray-400 font-mono">Free Tier</div>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
          style={{
            padding: expanded ? '8px 12px' : '8px 0',
            justifyContent: expanded ? 'flex-start' : 'center',
          }}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {expanded && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
