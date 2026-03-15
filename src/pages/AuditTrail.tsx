// src/pages/AuditTrail.tsx
import React, { useState } from 'react';
import { Search, History, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';

const AuditTrail: React.FC = () => {
  const { auditLogs } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter logs by User, Action, or Company Name
  const filteredLogs = auditLogs.filter(log => 
    log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entityId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionStyles = (action: string) => {
    switch(action) {
      case 'CREATE': return { color: 'text-green-600', bg: 'bg-green-100', icon: <PlusCircle className="w-4 h-4" /> };
      case 'UPDATE': return { color: 'text-blue-600', bg: 'bg-blue-100', icon: <Edit className="w-4 h-4" /> };
      case 'DELETE': return { color: 'text-red-600', bg: 'bg-red-100', icon: <Trash2 className="w-4 h-4" /> };
      default: return { color: 'text-slate-600', bg: 'bg-slate-100', icon: <History className="w-4 h-4" /> };
    }
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-slate-900 text-3xl font-black tracking-tight">System Audit Trail</h1>
          <p className="text-slate-500 text-base">Track all additions, modifications, and deletions of MOA records.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-md">
        <label className="relative flex items-center">
          <Search className="absolute left-4 text-slate-400 w-5 h-5" />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#11a4d4]/50 focus:border-[#11a4d4] outline-none text-sm shadow-sm transition-all" 
            placeholder="Search by user, company, or action..."
          />
        </label>
      </div>

      {/* Timeline/Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Target Record</th>
                <th className="px-6 py-4">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <History className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-base font-medium text-slate-900">No recent activity found.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const style = getActionStyles(log.actionType);
                  const timeInfo = formatTimestamp(log.timestamp);
                  
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{timeInfo.date}</div>
                        <div className="text-xs text-slate-500">{timeInfo.time}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.color}`}>
                          {style.icon}
                          {log.actionType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{log.entityName}</div>
                        <div className="font-mono text-[10px] text-[#11a4d4] mt-0.5">{log.entityId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                            {log.userName.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-900">{log.userName}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500">
          <span>Showing {filteredLogs.length} recorded events</span>
        </div>
      </div>

    </div>
  );
};

export default AuditTrail;