// src/pages/UserManagement.tsx
import React, { useState } from 'react';
import { 
  UserPlus, 
  Search, 
  ChevronDown, 
  Edit, 
  Ban, 
  RotateCcw, 
  History, 
  Shield, 
  Info 
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Role } from '../context/AuthContext';

// --- MOCK DATA (Activities stay local for now) ---
const mockActivities = [
  {
    id: 1,
    icon: UserPlus,
    iconColors: 'bg-emerald-100 text-emerald-600',
    title: 'New User Invited',
    description: (
      <>Admin <span className="text-[#11a4d4] font-bold">Ana Santos</span> invited <span className="font-bold">Liza Soberano</span> as Student Role.</>
    ),
    time: '2 hours ago',
  },
  {
    id: 2,
    icon: Shield,
    iconColors: 'bg-blue-100 text-blue-600',
    title: 'Maintainer Rights Updated',
    description: (
      <>Maintainer rights enabled for <span className="font-bold">Julian Dela Cruz</span> by System Admin.</>
    ),
    time: 'Yesterday, 4:45 PM',
  },
  {
    id: 3,
    icon: Ban,
    iconColors: 'bg-red-100 text-red-600',
    title: 'User Account Blocked',
    description: (
      <><span className="font-bold">Mark Reyes</span> account was blocked due to multiple invalid login attempts.</>
    ),
    time: 'Oct 24, 2023',
  },
];

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pull data and actions from our global store
  const { users, updateUserRole, toggleMaintainer, toggleUserBlock } = useStore();

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-slate-900 text-3xl font-black tracking-tight">User Directory</h1>
          <p className="text-slate-500 text-base">Manage institutional access, roles, and maintainer permissions.</p>
        </div>
        <button className="flex min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-xl h-12 px-6 bg-[#11a4d4] text-white text-sm font-bold shadow-lg shadow-[#11a4d4]/20 hover:opacity-90 transition-opacity">
          <UserPlus className="w-5 h-5" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="relative flex items-center">
            <Search className="absolute left-4 text-slate-400 w-5 h-5" />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#11a4d4]/50 focus:border-[#11a4d4] outline-none text-sm transition-all shadow-sm" 
              placeholder="Search by name or email (e.g. @neu.edu.ph)..."
            />
          </label>
        </div>
        <div className="flex gap-2">
          <button className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            <span>Role: All</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
          <button className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            <span>Status: Active</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Users Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">User Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Institutional Email</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Maintainer</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  
                  {/* Name & Avatar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${user.avatarColors}`}>
                        {user.initials}
                      </div>
                      <span className="font-semibold text-slate-900">{user.name}</span>
                    </div>
                  </td>
                  
                  {/* Email */}
                  <td className="px-6 py-4 text-slate-600 text-sm">{user.email}</td>
                  
                  {/* Interactive Role Dropdown */}
                  <td className="px-6 py-4">
                    <select 
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value as Role)}
                      className="text-xs font-bold px-2 py-1 rounded-md border border-slate-200 bg-white focus:ring-2 focus:ring-[#11a4d4] outline-none cursor-pointer capitalize"
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  
                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    {!user.isBlocked ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span> Blocked
                      </span>
                    )}
                  </td>
                  
                  {/* Maintainer Toggle (Disabled if not Faculty) */}
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleMaintainer(user.id)}
                      disabled={user.role !== 'faculty'}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#11a4d4] focus:ring-offset-2 
                        ${user.isMaintainer ? 'bg-[#11a4d4]' : 'bg-slate-200'} 
                        ${user.role !== 'faculty' ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      title={user.role !== 'faculty' ? "Only Faculty can be Maintainers" : "Toggle Maintainer Rights"}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${user.isMaintainer ? 'translate-x-4' : 'translate-x-0'}`}></span>
                    </button>
                  </td>
                  
                  {/* Action Buttons */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="Edit Role">
                        <Edit className="w-4 h-4" />
                      </button>
                      {!user.isBlocked ? (
                        <button 
                          onClick={() => toggleUserBlock(user.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors" 
                          title="Block User"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => toggleUserBlock(user.id)}
                          className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-500 transition-colors" 
                          title="Unblock User"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Table Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
          <p className="text-sm text-slate-500">Showing {users.length} of {users.length} users</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-sm text-slate-400 cursor-not-allowed shadow-sm">Previous</button>
            <button className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-sm hover:bg-slate-50 transition-colors shadow-sm text-slate-700">Next</button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Audit Trail & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#11a4d4]" />
            <h2 className="text-xl font-bold text-slate-900">Recent Management Activity</h2>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            {mockActivities.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activity.iconColors}`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{activity.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{activity.description}</p>
                  <p className="mt-1.5 text-[10px] text-slate-400 uppercase font-bold tracking-wider">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-slate-900">Directory Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Total Users</p>
              <p className="text-2xl font-black text-[#11a4d4] mt-1">{users.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Maintainers</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {users.filter(u => u.isMaintainer).length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Blocked</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {users.filter(u => u.isBlocked).length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Active</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {users.filter(u => !u.isBlocked).length}
              </p>
            </div>
          </div>
          
          <div className="mt-2 p-4 bg-[#11a4d4]/10 rounded-xl border border-[#11a4d4]/20">
            <p className="text-xs font-bold text-[#11a4d4] flex items-center gap-2">
              <Info className="w-4 h-4" />
              Maintenance Note
            </p>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Maintainers can manage MOA records including drafting, editing, and official archiving. The toggle is only available for Faculty accounts.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default UserManagement;