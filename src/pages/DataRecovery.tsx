// src/pages/DataRecovery.tsx
import React, { useState } from 'react';
import { ArchiveRestore, Search, RotateCcw, AlertOctagon, Building2, CheckCircle, X, Info } from 'lucide-react';
import { useStore, type MOA } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

const DataRecovery: React.FC = () => {
  const { moas, recoverMoa } = useStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // --- MODAL STATES ---
  // Holds the MOA the user is currently trying to recover
  const [targetMoa, setTargetMoa] = useState<MOA | null>(null);
  // Holds the MOA that was just successfully recovered
  const [successMoa, setSuccessMoa] = useState<MOA | null>(null);

  // Filter ONLY for items where isDeleted === true
  const deletedMoas = moas.filter(m => m.isDeleted === true);

  // Apply local search
  const displayedMoas = deletedMoas.filter(moa => 
    moa.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    moa.HTEID.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 1. Open the Confirmation Modal
  const handleInitiateRecovery = (moa: MOA) => {
    setTargetMoa(moa);
  };

  // 2. Execute Recovery and show Success Modal
  const handleConfirmRecovery = async () => {
    if (!targetMoa) return;
    
    await recoverMoa(targetMoa.HTEID);
    
    // Move from Confirm Modal to Success Modal
    setSuccessMoa(targetMoa);
    setTargetMoa(null);
  };

  // 3. Close Modals
  const handleDismissSuccess = () => {
    setSuccessMoa(null);
  };

  const handleNavigateToList = () => {
    setSuccessMoa(null);
    navigate('/moa-management'); // Redirect to the active list
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto relative">
      
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-slate-900 text-3xl font-black tracking-tight">Deleted MOA Recovery</h1>
          <p className="text-slate-500 text-base">Manage and restore soft-deleted Memorandum of Agreements from the database.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-md">
        <label className="relative flex items-center">
          <Search className="absolute left-4 text-slate-400 w-5 h-5" />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#11a4d4] outline-none text-sm shadow-sm transition-all" 
            placeholder="Search deleted records..."
          />
        </label>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-red-50/30 flex items-center gap-2 text-red-700">
          <AlertOctagon className="w-5 h-5" />
          <h2 className="text-sm font-bold">Deleted Records Archive</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">HTEID & Company</th>
                <th className="px-6 py-4">Original Status</th>
                <th className="px-6 py-4">Endorsing College</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedMoas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <ArchiveRestore className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-base font-medium text-slate-900">No deleted records found.</p>
                    <p className="text-sm">The archive is currently empty.</p>
                  </td>
                </tr>
              ) : (
                displayedMoas.map((moa) => (
                  <tr key={moa.HTEID} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{moa.companyName}</div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">{moa.HTEID}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide bg-slate-100 text-slate-600">
                        {moa.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{moa.endorsedByCollege}</td>
                    <td className="px-6 py-4 text-right">
                      {/* Open the Custom Modal instead of window.confirm */}
                      <button 
                        onClick={() => handleInitiateRecovery(moa)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 rounded-lg text-xs font-bold transition-colors shadow-sm"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restore
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warning Box */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-4 items-start">
        <Info className="w-5 h-5 text-blue-600 shrink-0" />
        <div>
          <h4 className="text-blue-800 font-bold text-sm">Data Retention Policy</h4>
          <p className="text-blue-600/80 text-xs mt-1 leading-relaxed">
            Soft-deleted MOAs are kept in the database. Once recovered, the MOA will return to its previous status and will be visible in the main MOA List again.
          </p>
        </div>
      </div>

      {/* ========================================= */}
      {/* 1. CONFIRM RECOVERY MODAL (Image 10)      */}
      {/* ========================================= */}
      {targetMoa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3 text-slate-900">
                <div className="text-orange-500">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold leading-tight">Deleted MOA Recovery</h2>
              </div>
              <button onClick={() => setTargetMoa(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-8 pt-8 pb-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-slate-900 text-2xl font-bold leading-tight mb-2">Confirm Recovery?</h3>
              <p className="text-slate-500 text-sm font-normal leading-relaxed mb-4">
                Are you sure you want to recover the record for:
              </p>
              <div className="bg-slate-50 px-6 py-3 rounded-lg border border-slate-100 mb-6 w-full">
                <h1 className="text-slate-900 text-lg font-bold tracking-tight truncate">{targetMoa.companyName}</h1>
                <p className="text-xs text-slate-400 font-mono mt-1">{targetMoa.HTEID}</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-8 pb-8 flex flex-col gap-3">
              <button 
                onClick={handleConfirmRecovery}
                className="flex items-center justify-center rounded-xl h-12 px-5 bg-blue-800 hover:bg-blue-900 text-white text-sm font-bold transition-all shadow-md w-full"
              >
                Confirm Recovery
              </button>
              <button 
                onClick={() => setTargetMoa(null)}
                className="flex items-center justify-center rounded-xl h-12 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all w-full"
              >
                Cancel
              </button>
            </div>
            <div className="px-8 pb-6">
              <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-semibold">Institutional Recovery System</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* 2. SUCCESS RECOVERY MODAL (Image 11)      */}
      {/* ========================================= */}
      {successMoa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">MOA Successfully Recovered</h2>
              <p className="text-slate-600 text-sm mb-8">
                The record for <span className="font-semibold text-slate-900">[{successMoa.companyName}]</span> has been restored to the active MOA list.
              </p>
              
              <div className="w-full flex flex-col gap-3">
                <button 
                  onClick={handleNavigateToList}
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all shadow-md"
                >
                  View Active MOA List
                </button>
                <button 
                  onClick={handleDismissSuccess}
                  className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>

            <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-500">
                <Info className="w-4 h-4" />
                <span className="text-xs font-medium">Recovery Complete</span>
              </div>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default DataRecovery;