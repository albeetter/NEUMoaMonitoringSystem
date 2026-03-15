// src/layouts/MainLayout.tsx
import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  ClipboardList, 
  Settings,
  Search,
  Bell,
  LogOut,
  DatabaseBackup
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../store/useStore';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const { 
    fetchMoas, 
    fetchUsers, 
    fetchAuditLogs, 
    globalSearchTerm,        
    setGlobalSearchTerm      
  } = useStore();

  // --- NEW: Notification Menu State ---
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    fetchMoas();
    fetchUsers();
    fetchAuditLogs();
  }, [fetchMoas, fetchUsers, fetchAuditLogs]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const allNavItems = [
    { path: '/admin-dashboard', label: 'Dashboard', icon: LayoutDashboard, allowedRoles: ['admin'] },
    { path: '/faculty-dashboard', label: 'Dashboard', icon: LayoutDashboard, allowedRoles: ['faculty'] },
    { path: '/student-dashboard', label: 'MOA Directory', icon: LayoutDashboard, allowedRoles: ['student'] },
    { path: '/moa-management', label: 'MOA Management', icon: FileText, allowedRoles: ['admin', 'faculty'] },
    { path: '/user-management', label: 'User Management', icon: Users, allowedRoles: ['admin'] },
    { path: '/audit-trail', label: 'Audit Trail', icon: ClipboardList, allowedRoles: ['admin'] },
    { path: '/data-recovery', label: 'Data Recovery', icon: DatabaseBackup, allowedRoles: ['admin'] },
    { path: '/settings', label: 'Settings', icon: Settings, allowedRoles: ['admin', 'faculty', 'student'] },
  ];

  const visibleNavItems = allNavItems.filter(item => 
    user && item.allowedRoles.includes(user.role)
  );

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans">
      
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 z-20">
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
             <img 
                 src="/NEU Logo.svg"
                 alt="NEU Logo" 
                 className="w-8 h-8 object-contain" 
                 />
                 <span className="text-white font-bold text-lg tracking-wide">NEU MOA</span>
                </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-[#11a4d4] text-white shadow-md'
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
            System Status
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-slate-300">Server Online</span>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
          
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              value={globalSearchTerm}
              onChange={(e) => setGlobalSearchTerm(e.target.value)}
              placeholder="Global Search (Company, Industry, Contact)..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#11a4d4] focus:border-transparent text-sm transition-all"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            
            {/* ========================================= */}
            {/* FIX 1: WORKING NOTIFICATION BELL          */}
            {/* ========================================= */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifs(!showNotifs)}
                className="text-slate-400 hover:text-[#11a4d4] transition-colors p-2 relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>

              {/* Notification Dropdown Menu */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                    <button 
                      onClick={() => setShowNotifs(false)} 
                      className="text-xs text-[#11a4d4] font-medium hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="p-6 text-center flex flex-col items-center justify-center">
                    <Bell className="w-8 h-8 text-slate-200 mb-2" />
                    <p className="text-sm font-medium text-slate-900">You're all caught up!</p>
                    <p className="text-xs text-slate-500 mt-1">No new system alerts or MOA updates.</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-8 w-px bg-slate-200 mx-2"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-none mb-1">
                  {user?.name || 'Loading...'}
                </p>
                <p className="text-xs text-slate-500 capitalize">
                  {user?.role || 'Guest'}
                </p>
              </div>
              
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border border-slate-200 object-cover shadow-sm"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[#11a4d4] font-bold text-lg uppercase shadow-sm">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>

            <button 
              onClick={handleLogout}
              className="ml-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;