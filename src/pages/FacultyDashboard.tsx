// src/pages/FacultyDashboard.tsx
import React, { useState } from 'react';
import { BookOpen, Clock, AlertTriangle, CheckCircle, Edit, Trash2, X, Plus } from 'lucide-react';
import { useStore, MoaStatus, type MoaStatusType, type MOA } from '../store/useStore';
import { useAuth } from '../context/AuthContext';

const PREDEFINED_INDUSTRIES = [
  'Information Technology', 'Finance & Banking', 'Manufacturing', 
  'Construction & Engineering', 'Education', 'Healthcare', 'Creatives & Marketing'
];

const FacultyDashboard: React.FC = () => {
  const { moas, users, deleteMoa, updateMoa, addMoa } = useStore();
  const { user: authUser } = useAuth(); // Get current logged in user

  // ACCESS CONTROL LOGIC: Find this user's DB profile to check maintainer status
  const currentUserProfile = users.find(u => u.id === authUser?.uid);
  const canEdit = authUser?.role === 'admin' || (authUser?.role === 'faculty' && currentUserProfile?.isMaintainer);

  const [selectedCollege, setSelectedCollege] = useState('College of Informatics');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const defaultFormData = {
    companyName: '', address: '', contactPerson: '', email: '', 
    industryType: PREDEFINED_INDUSTRIES[0], // Default to first dropdown option
    effectiveDate: '', endDate: '', status: MoaStatus.DRAFT as MoaStatusType, endorsedByCollege: selectedCollege 
  };
  const [formData, setFormData] = useState(defaultFormData);

  const collegeMoas = moas.filter(m => !m.isDeleted && m.endorsedByCollege === selectedCollege);
  
  const activeCount = collegeMoas.filter(m => m.status === MoaStatus.ACTIVE).length;
  const draftCount = collegeMoas.filter(m => m.status === MoaStatus.DRAFT).length;
  const expiringCount = collegeMoas.filter(m => m.status === MoaStatus.EXPIRING).length;
  const pendingCount = collegeMoas.filter(m => 
    ([MoaStatus.LEGAL_REVIEW, MoaStatus.VPAA_APPROVED, MoaStatus.HTE_CONFIRMATION] as MoaStatusType[]).includes(m.status)
  ).length;

  const getStatusColors = (status: MoaStatusType) => {
    switch (status) {
      case MoaStatus.ACTIVE:
      case MoaStatus.VPAA_APPROVED: return 'bg-green-100 text-green-800';
      case MoaStatus.LEGAL_REVIEW:
      case MoaStatus.DRAFT: return 'bg-amber-100 text-amber-800';
      case MoaStatus.HTE_CONFIRMATION: return 'bg-blue-100 text-blue-800';
      case MoaStatus.EXPIRING: return 'bg-orange-100 text-orange-800';
      case MoaStatus.EXPIRED:
      case MoaStatus.TERMINATED: return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditMode(false); setEditId(null);
    setFormData({ ...defaultFormData, endorsedByCollege: selectedCollege });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (moa: MOA) => {
    setIsEditMode(true); setEditId(moa.HTEID);
    setFormData({
      companyName: moa.companyName, address: moa.address, contactPerson: moa.contactPerson, email: moa.email,
      industryType: moa.industryType, effectiveDate: moa.effectiveDate, endDate: moa.endDate || '',
      status: moa.status, endorsedByCollege: moa.endorsedByCollege
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (isEditMode && editId) await updateMoa(editId, formData);
    else await addMoa(formData);
    setIsSubmitting(false); setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-8 w-full relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Faculty Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage partnerships and track approval progress for your college.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-slate-700">My College:</label>
          <select value={selectedCollege} onChange={(e) => setSelectedCollege(e.target.value)} className="border border-slate-300 rounded-lg text-sm font-medium focus:border-[#11a4d4] focus:ring-[#11a4d4] px-4 py-2.5 bg-slate-50 outline-none cursor-pointer">
            <option value="College of Informatics">College of Informatics</option>
            <option value="College of Engineering">College of Engineering</option>
            <option value="College of Business">College of Business</option>
            <option value="College of Arts & Sciences">College of Arts & Sciences</option>
          </select>
          
          {/* SPRINT 3 ACCESS CONTROL: Hide if not maintainer */}
          {canEdit && (
            <button onClick={handleOpenCreateModal} className="bg-[#11a4d4] hover:bg-[#0e8ab3] text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2 ml-2">
              <Plus className="w-4 h-4" /> Draft MOA
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0"><CheckCircle className="w-6 h-6" /></div>
          <div><p className="text-sm font-medium text-slate-500">Active Partners</p><p className="text-2xl font-black text-slate-900">{activeCount}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-[#11a4d4] shrink-0"><Clock className="w-6 h-6" /></div>
          <div><p className="text-sm font-medium text-slate-500">Pending Approvals</p><p className="text-2xl font-black text-slate-900">{pendingCount}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0"><BookOpen className="w-6 h-6" /></div>
          <div><p className="text-sm font-medium text-slate-500">Working Drafts</p><p className="text-2xl font-black text-slate-900">{draftCount}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-200 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-bl-full -z-10"></div>
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 z-10"><AlertTriangle className="w-6 h-6" /></div>
          <div className="z-10"><p className="text-sm font-medium text-orange-800">Expiring Soon</p><p className="text-2xl font-black text-orange-600">{expiringCount}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">Partnerships for {selectedCollege}</h2>
          <p className="text-sm text-slate-500 mt-1">Showing all MOA records assigned to this department.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Company Name</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Industry</th>
                <th className="px-6 py-4">Status & Validity</th>
                {canEdit && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {collegeMoas.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 5 : 4} className="px-6 py-12 text-center text-slate-500">
                    <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-base font-medium text-slate-900">No MOAs found for this college.</p>
                  </td>
                </tr>
              ) : (
                collegeMoas.map((row) => (
                  <tr key={row.HTEID} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4"><div className="font-bold text-slate-900">{row.companyName}</div><div className="font-mono text-[10px] text-slate-400 mt-0.5">{row.HTEID}</div></td>
                    <td className="px-6 py-4"><div className="text-slate-900 font-medium">{row.contactPerson}</div><a href={`mailto:${row.email}`} className="text-xs text-[#11a4d4] hover:underline mt-0.5 block">{row.email}</a></td>
                    <td className="px-6 py-4 text-slate-600">{row.industryType}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide ${getStatusColors(row.status)}`}>{row.status}</span>
                      {row.endDate && <div className="text-[10px] text-slate-500 mt-1">Ends: {row.endDate}</div>}
                    </td>
                    
                    {/* SPRINT 3 ACCESS CONTROL: Hide Action buttons if not maintainer */}
                    {canEdit && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => handleOpenEditModal(row)} className="p-1.5 text-[#11a4d4] hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => { if (window.confirm(`Delete MOA for ${row.companyName}?`)) deleteMoa(row.HTEID); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Draft"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">{isEditMode ? `Edit MOA: ${editId}` : 'Draft New MOA'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="faculty-moa-form" onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Company Name *</label>
                    <input required type="text" value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#11a4d4] outline-none text-sm" />
                  </div>
                  <div className="space-y-1">
                    {/* SPRINT 3 FIX: Industry is now a Dropdown */}
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Industry *</label>
                    <select required value={formData.industryType} onChange={(e) => setFormData({...formData, industryType: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#11a4d4] outline-none text-sm">
                      {PREDEFINED_INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Address *</label>
                  <input required type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#11a4d4] outline-none text-sm" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Contact Person *</label>
                    <input required type="text" value={formData.contactPerson} onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#11a4d4] outline-none text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Contact Email *</label>
                    <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#11a4d4] outline-none text-sm" />
                  </div>
                </div>

                {/* SPRINT 3 FIX: End Date added for Auto-Calculation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Effective Date *</label>
                    <input required type="date" value={formData.effectiveDate} onChange={(e) => setFormData({...formData, effectiveDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#11a4d4] outline-none text-sm text-slate-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">End Date (For Auto-Expiry) *</label>
                    <input required type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#11a4d4] outline-none text-sm text-slate-600" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status *</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as MoaStatusType})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#11a4d4] outline-none text-sm">
                      {Object.values(MoaStatus).map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">College</label>
                    <input type="text" readOnly value={formData.endorsedByCollege} className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded-lg outline-none text-sm text-slate-500 cursor-not-allowed" />
                  </div>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
              <button type="submit" form="faculty-moa-form" disabled={isSubmitting} className="px-6 py-2 text-sm font-bold text-white bg-[#11a4d4] hover:bg-[#0e8ab3] rounded-lg shadow-sm transition-colors disabled:opacity-70 flex items-center gap-2">
                {isSubmitting ? 'Saving...' : (isEditMode ? 'Update MOA' : 'Save Draft')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;