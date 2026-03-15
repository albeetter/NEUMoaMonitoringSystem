import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Building2, X, Eye } from 'lucide-react';
import { useStore, MoaStatus, type MoaStatusType, type MOA } from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PREDEFINED_INDUSTRIES = [
  'Information Technology', 
  'Finance & Banking', 
  'Manufacturing', 
  'Construction & Engineering', 
  'Education', 
  'Healthcare', 
  'Creatives & Marketing'
];

const MoaManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const { moas, users, deleteMoa, addMoa, updateMoa } = useStore();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  // ACCESS CONTROL
  const currentUserProfile = users.find(u => u.id === authUser?.uid);
  const canEdit = authUser?.role === 'admin' || (authUser?.role === 'faculty' && currentUserProfile?.isMaintainer);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const defaultFormData = {
    companyName: '', 
    address: '', 
    contactPerson: '', 
    email: '', 
    industryType: PREDEFINED_INDUSTRIES[0],
    effectiveDate: '', 
    endDate: '', 
    status: MoaStatus.DRAFT as MoaStatusType, 
    endorsedByCollege: 'College of Informatics'
  };
  
  const [formData, setFormData] = useState(defaultFormData);

  const getStatusColors = (status: MoaStatusType) => {
    switch (status) {
      case MoaStatus.ACTIVE:
      case MoaStatus.VPAA_APPROVED: 
        return 'bg-green-100 text-green-800';
      case MoaStatus.LEGAL_REVIEW:
      case MoaStatus.DRAFT: 
        return 'bg-amber-100 text-amber-800';
      case MoaStatus.HTE_CONFIRMATION: 
        return 'bg-blue-100 text-blue-800';
      case MoaStatus.EXPIRING: 
        return 'bg-orange-100 text-orange-800';
      case MoaStatus.EXPIRED:
      case MoaStatus.TERMINATED: 
        return 'bg-red-100 text-red-800';
      default: 
        return 'bg-slate-100 text-slate-800';
    }
  };

  const displayedMoas = moas.filter(moa => {
    if (moa.isDeleted) return false;
    if (statusFilter && moa.status !== statusFilter) return false;
    if (searchTerm && !moa.companyName.toLowerCase().includes(searchTerm.toLowerCase()) && !moa.HTEID.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleDelete = (id: string, companyName: string) => {
    if (window.confirm(`Are you sure you want to delete the MOA for ${companyName}?`)) {
      deleteMoa(id);
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditMode(false); 
    setEditId(null); 
    setFormData(defaultFormData); 
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (moa: MOA) => {
    setIsEditMode(true); 
    setEditId(moa.HTEID);
    setFormData({
      companyName: moa.companyName, 
      address: moa.address, 
      contactPerson: moa.contactPerson, 
      email: moa.email,
      industryType: moa.industryType, 
      effectiveDate: moa.effectiveDate, 
      endDate: moa.endDate || '', 
      status: moa.status, 
      endorsedByCollege: moa.endorsedByCollege
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (isEditMode && editId) {
      await updateMoa(editId, formData);
    } else {
      await addMoa(formData);
    }
    
    setFormData(defaultFormData); 
    setIsEditMode(false); 
    setEditId(null); 
    setIsSubmitting(false); 
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto relative">
      
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-slate-900 text-3xl font-black tracking-tight">MOA Management</h1>
          <p className="text-slate-500 text-base">Track, update, and manage all Memorandums of Agreement.</p>
        </div>
        {canEdit && (
          <button 
            onClick={handleOpenCreateModal} 
            className="flex min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-xl h-12 px-6 bg-[#11a4d4] text-white text-sm font-bold shadow-lg shadow-[#11a4d4]/20 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" /> 
            <span>New MOA</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#11a4d4]/50 focus:border-[#11a4d4] outline-none text-sm transition-all shadow-sm" 
            placeholder="Search by HTEID or Company Name..."
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          className="h-12 rounded-xl bg-white border border-slate-200 px-4 text-sm font-medium text-slate-700 shadow-sm outline-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          {Object.values(MoaStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">HTEID / Partner</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Contact Details</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Dates & College</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedMoas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-base font-medium text-slate-900">No active MOAs found</p>
                  </td>
                </tr>
              ) : (
                displayedMoas.map((moa) => (
                  <tr key={moa.HTEID} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Company Cell */}
                    <td className="px-6 py-4">
                      <div className="font-mono text-[10px] text-slate-400 mb-0.5">{moa.HTEID}</div>
                      <div className="font-bold text-slate-900 text-sm leading-tight">{moa.companyName}</div>
                      <div className="text-xs text-[#11a4d4] font-medium mt-0.5">{moa.industryType}</div>
                    </td>
                    
                    {/* Contact Cell */}
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{moa.contactPerson}</div>
                      <a href={`mailto:${moa.email}`} className="text-xs text-slate-500 hover:text-[#11a4d4] hover:underline transition-colors block mt-0.5">
                        {moa.email}
                      </a>
                    </td>
                    
                    {/* Status Cell */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusColors(moa.status)}`}>
                        {moa.status}
                      </span>
                    </td>
                    
                    {/* Dates Cell */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">
                        <span className="text-slate-500 text-xs mr-1">Effective:</span> {moa.effectiveDate}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 truncate max-w-[200px]">{moa.endorsedByCollege}</div>
                    </td>
                    
                    {/* Actions Cell */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        
                        {/* VIEW BUTTON: Visible to everyone */}
                        <button 
                          onClick={() => navigate(`/moa-details/${moa.HTEID}`)}
                          className="flex items-center gap-1 px-2 py-1.5 bg-slate-100 text-slate-600 hover:bg-[#11a4d4] hover:text-white rounded-md text-xs font-bold transition-colors"
                          title="View Full Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>

                        {/* EDIT/DELETE BUTTONS: Only visible to Admins & Maintainers */}
                        {canEdit && (
                          <>
                            <div className="w-px h-4 bg-slate-200 mx-1"></div>
                            <button 
                              onClick={() => handleOpenEditModal(moa)} 
                              className="p-1.5 hover:bg-blue-50 rounded-lg text-slate-500 hover:text-[#11a4d4] transition-colors" 
                              title="Edit MOA"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(moa.HTEID, moa.companyName)} 
                              className="p-1.5 hover:bg-red-50 rounded-lg text-slate-500 hover:text-red-500 transition-colors" 
                              title="Soft Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MOA FORM MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">
                {isEditMode ? `Edit MOA: ${editId}` : 'Create New MOA'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="moa-form" onSubmit={handleFormSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Company Name *</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.companyName} 
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})} 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#11a4d4] outline-none text-sm" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Industry *</label>
                    <select 
                      required 
                      value={formData.industryType} 
                      onChange={(e) => setFormData({...formData, industryType: e.target.value})} 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#11a4d4] outline-none text-sm"
                    >
                      {PREDEFINED_INDUSTRIES.map(ind => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Address *</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#11a4d4] outline-none text-sm" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Contact Person *</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.contactPerson} 
                      onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#11a4d4] outline-none text-sm" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Contact Email *</label>
                    <input 
                      required 
                      type="email" 
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#11a4d4] outline-none text-sm" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Effective Date *</label>
                    <input 
                      required 
                      type="date" 
                      value={formData.effectiveDate} 
                      onChange={(e) => setFormData({...formData, effectiveDate: e.target.value})} 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#11a4d4] outline-none text-sm text-slate-600" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">End Date (For Expiry) *</label>
                    <input 
                      required 
                      type="date" 
                      value={formData.endDate} 
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#11a4d4] outline-none text-sm text-slate-600" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status *</label>
                    <select 
                      value={formData.status} 
                      onChange={(e) => setFormData({...formData, status: e.target.value as MoaStatusType})} 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#11a4d4] outline-none text-sm"
                    >
                      {Object.values(MoaStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Endorsed By *</label>
                    <select 
                      value={formData.endorsedByCollege} 
                      onChange={(e) => setFormData({...formData, endorsedByCollege: e.target.value})} 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#11a4d4] outline-none text-sm"
                    >
                      <option value="College of Informatics">College of Informatics</option>
                      <option value="College of Engineering">College of Engineering</option>
                      <option value="College of Business">College of Business</option>
                      <option value="College of Arts & Sciences">College of Arts & Sciences</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="moa-form" 
                disabled={isSubmitting} 
                className="px-6 py-2 text-sm font-bold text-white bg-[#11a4d4] hover:bg-[#0e8ab3] rounded-lg shadow-sm transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {isSubmitting ? 'Saving...' : 'Save MOA Record'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MoaManagement;