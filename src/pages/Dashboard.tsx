import React, { useState } from 'react';
import { Download, Filter, Edit, Trash2, RotateCcw, X, Calendar, Eye, Building2 } from 'lucide-react';
import { useStore, MoaStatus, type MoaStatusType, type MOA } from '../store/useStore';
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

const Dashboard: React.FC = () => {
  const { moas, users, deleteMoa, updateMoa, globalSearchTerm } = useStore();
  const navigate = useNavigate();

  // ==========================================
  // FILTER STATES
  // ==========================================
  const [collegeFilter, setCollegeFilter] = useState('All Colleges');
  const [dateFilter, setDateFilter] = useState('');
  const [showTableFilter, setShowTableFilter] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  // ==========================================
  // MODAL STATES
  // ==========================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // ==========================================
  // DERIVED STATE & ANALYTICS (SPRINT 5)
  // ==========================================
  
  // 1. Apply Top-Level Filters (Affects Stats & Table)
  const filteredMoas = moas.filter(m => {
    if (m.isDeleted) return false;
    if (collegeFilter !== 'All Colleges' && m.endorsedByCollege !== collegeFilter) return false;
    if (dateFilter && m.effectiveDate !== dateFilter && m.endDate !== dateFilter) return false;
    return true;
  });
  
  // 2. Calculate Statistics Cards
  const activeCount = filteredMoas.filter(m => m.status === MoaStatus.ACTIVE).length;
  const expiringCount = filteredMoas.filter(m => m.status === MoaStatus.EXPIRING).length;
  
  const legalCount = filteredMoas.filter(m => m.status === MoaStatus.LEGAL_REVIEW).length;
  const vpaaCount = filteredMoas.filter(m => m.status === MoaStatus.VPAA_APPROVED).length;
  const hteCount = filteredMoas.filter(m => m.status === MoaStatus.HTE_CONFIRMATION).length;
  
  const totalProcessing = legalCount + vpaaCount + hteCount || 1; 
  const legalPct = Math.round((legalCount / totalProcessing) * 100);
  const vpaaPct = Math.round((vpaaCount / totalProcessing) * 100);
  const htePct = Math.round((hteCount / totalProcessing) * 100);

  // 3. Apply Table-Specific Filters (Status Dropdown & Global Search)
  const tableMoas = filteredMoas.filter(m => {
    if (statusFilter && m.status !== statusFilter) return false;

    if (!globalSearchTerm) return true;
    const term = globalSearchTerm.toLowerCase();
    
    return (
      m.companyName.toLowerCase().includes(term) ||
      m.industryType.toLowerCase().includes(term) ||
      m.contactPerson.toLowerCase().includes(term) ||
      m.address.toLowerCase().includes(term) ||
      m.endorsedByCollege.toLowerCase().includes(term)
    );
  });

  const totalUsers = users.length;
  const blockedUsers = users.filter(u => u.isBlocked).length;

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================
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

  const handleDelete = (id: string, companyName: string) => {
    if (window.confirm(`Are you sure you want to soft-delete the MOA for ${companyName}? It will be moved to Data Recovery.`)) {
      deleteMoa(id);
    }
  };

  const handleExportCSV = () => {
    if (tableMoas.length === 0) {
      alert("No data available to export.");
      return;
    }
    const headers = [
      "HTEID", "Company Name", "Industry", "Address", "Contact Person", 
      "Email", "Status", "Effective Date", "End Date", "Endorsed By"
    ];
    const escapeCSV = (str: string) => `"${str.replace(/"/g, '""')}"`; 
    
    const csvRows = tableMoas.map(moa => [
      escapeCSV(moa.HTEID), 
      escapeCSV(moa.companyName), 
      escapeCSV(moa.industryType), 
      escapeCSV(moa.address), 
      escapeCSV(moa.contactPerson),
      escapeCSV(moa.email), 
      escapeCSV(moa.status), 
      escapeCSV(moa.effectiveDate), 
      escapeCSV(moa.endDate || ''), 
      escapeCSV(moa.endorsedByCollege)
    ].join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `NEU_MOA_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenEditModal = (moa: MOA) => {
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
    if (!editId) return;
    
    setIsSubmitting(true);
    await updateMoa(editId, formData);
    
    setFormData(defaultFormData); 
    setEditId(null); 
    setIsSubmitting(false); 
    setIsModalOpen(false);
  };

  // ==========================================
  // RENDER COMPONENT
  // ==========================================
  return (
    <div className="flex flex-col gap-8 w-full relative">
      
      {/* --- PAGE HEADER & TOP FILTERS --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500">Monitoring MOA status and university partnerships</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          
          <select 
            value={collegeFilter} 
            onChange={(e) => setCollegeFilter(e.target.value)} 
            className="border border-slate-300 rounded-lg text-sm focus:border-[#11a4d4] focus:ring-[#11a4d4] px-3 py-2 bg-white outline-none cursor-pointer"
          >
            <option value="All Colleges">All Colleges</option>
            <option value="College of Engineering">College of Engineering</option>
            <option value="College of Informatics">College of Informatics</option>
            <option value="College of Arts & Sciences">College of Arts & Sciences</option>
          </select>
          
          <div className="relative flex items-center">
            <div className="absolute left-3 text-slate-400 pointer-events-none">
              <Calendar className="w-4 h-4" />
            </div>
            <input 
              type="date" 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)} 
              className="border border-slate-300 rounded-lg text-sm focus:border-[#11a4d4] focus:ring-[#11a4d4] pl-9 pr-8 py-2 bg-white outline-none cursor-pointer" 
            />
            {dateFilter && (
              <button 
                onClick={() => setDateFilter('')} 
                className="absolute right-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Clear Date Filter"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <button 
            onClick={handleExportCSV} 
            className="bg-[#11a4d4] hover:bg-[#0e8ab3] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" /> 
            Export Report
          </button>
        </div>
      </div>

      {/* --- STATISTICS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Active MOAs */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Active MOAs</p>
              {/* Green Pill Badge */}
              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                +2 this month
              </span>
            </div>
            <p className="text-4xl font-bold text-slate-900 mt-4">{activeCount}</p>
          </div>
          {/* Dynamic Success Rate */}
          <div className="mt-6 flex items-center text-sm text-slate-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></span>
            {Math.round((activeCount / (filteredMoas.length || 1)) * 100)}% Success Rate
          </div>
        </div>

        {/* Processing Pipeline */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-2">Processing Pipeline</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-600">Legal Dept.</span>
                <span className="text-xs font-bold text-amber-600">{legalCount}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full transition-all duration-500" style={{ width: `${legalCount === 0 ? 0 : legalPct}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-600">VPAA Office</span>
                <span className="text-xs font-bold text-green-600">{vpaaCount}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-400 h-full transition-all duration-500" style={{ width: `${vpaaCount === 0 ? 0 : vpaaPct}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-600">HTE Confirmation</span>
                <span className="text-xs font-bold text-blue-600">{hteCount}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-400 h-full transition-all duration-500" style={{ width: `${hteCount === 0 ? 0 : htePct}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Expiring (30 Days)</p>
            <p className="text-4xl font-bold text-red-600 mt-4">{expiringCount}</p>
          </div>
          {/* Action Button that filters the table */}
          <button 
            onClick={() => {
              setStatusFilter(MoaStatus.EXPIRING);
              setShowTableFilter(true);
            }}
            disabled={expiringCount === 0}
            className="w-full mt-6 py-2.5 border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            View Urgent List
          </button>
        </div>

        {/* User Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">User Status</p>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalUsers}</p>
              <p className="text-xs text-slate-400">Total Users</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-red-500">{blockedUsers}</p>
              <p className="text-xs text-red-400 font-medium">Blocked</p>
            </div>
          </div>
          
          <div className="mt-4 flex -space-x-2">
            {users.slice(0, 3).map(u => (
              <div key={u.id} className={`h-6 w-6 flex items-center justify-center rounded-full border-2 border-white text-[8px] font-bold ${u.avatarColors}`}>
                {u.initials}
              </div>
            ))}
            {users.length > 3 && (
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 border-2 border-white text-[8px] text-slate-500 font-bold z-10">
                +{users.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MOA TABLE SECTION --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">
            {globalSearchTerm ? `Search Results for "${globalSearchTerm}"` : 'Recent MOA Activity'}
          </h2>
          
          {/* Table Filter Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowTableFilter(!showTableFilter)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                showTableFilter || statusFilter 
                  ? 'bg-[#11a4d4]/10 text-[#11a4d4]' 
                  : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              {statusFilter ? 'Filtered' : 'Filter'}
            </button>

            {showTableFilter && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Filter by Status</h3>
                </div>
                <div className="p-4">
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#11a4d4] cursor-pointer"
                  >
                    <option value="">All Statuses</option>
                    {Object.values(MoaStatus).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                {statusFilter && (
                  <div className="px-4 pb-4">
                    <button 
                      onClick={() => { setStatusFilter(''); setShowTableFilter(false); }}
                      className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
                    >
                      Clear Filter
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Company Name</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Industry</th>
                <th className="px-6 py-4">Status & Validity</th>
                <th className="px-6 py-4">Endorsed By</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableMoas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <Building2 className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                    <p className="text-base font-medium text-slate-900">No MOA records found.</p>
                    <p className="text-sm mt-1">Adjust your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                tableMoas.map((row) => (
                  <tr key={row.HTEID} className={`transition-colors ${row.status === MoaStatus.EXPIRED ? 'bg-red-50/30 hover:bg-red-50' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{row.companyName}</div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">{row.HTEID}</div>
                      <div className="text-xs text-slate-500 mt-1 truncate max-w-[200px]">{row.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 font-medium">{row.contactPerson}</div>
                      <a href={`mailto:${row.email}`} className="text-xs text-[#11a4d4] hover:underline mt-0.5 block">{row.email}</a>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{row.industryType}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide ${getStatusColors(row.status)}`}>
                        {row.status}
                      </span>
                      <div className="text-xs text-slate-500 mt-2"><span className="font-medium text-slate-600">Start:</span> {row.effectiveDate}</div>
                      {row.endDate && <div className="text-xs text-slate-500"><span className="font-medium text-slate-600">End:</span> {row.endDate}</div>}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">{row.endorsedByCollege}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <button 
                          onClick={() => navigate(`/moa-details/${row.HTEID}`)}
                          className="flex items-center gap-1 px-2 py-1.5 bg-slate-100 text-slate-600 hover:bg-[#11a4d4] hover:text-white rounded-md text-xs font-bold transition-colors"
                          title="View Full Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        
                        <div className="w-px h-4 bg-slate-200 mx-1"></div>
                        
                        {/* Recover Button (Only shows if status is Expired) */}
                        {row.status === MoaStatus.EXPIRED && (
                          <button className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title="Recover Expired">
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button onClick={() => handleOpenEditModal(row)} className="p-1.5 text-slate-500 hover:bg-blue-50 hover:text-[#11a4d4] rounded-lg transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        {/* Delete Button (Hidden if already Expired) */}
                        {row.status !== MoaStatus.EXPIRED && (
                          <button onClick={() => handleDelete(row.HTEID, row.companyName)} className="p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors" title="Soft Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* --- EDIT MOA MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">
                Edit MOA: {editId}
              </h3>
              <button 
                onClick={() => { setIsModalOpen(false); setEditId(null); }} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="dashboard-edit-form" onSubmit={handleFormSubmit} className="space-y-4">
                
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
                      {PREDEFINED_INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
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
                      {Object.values(MoaStatus).map(status => <option key={status} value={status}>{status}</option>)}
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
                onClick={() => { setIsModalOpen(false); setEditId(null); }} 
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="dashboard-edit-form" 
                disabled={isSubmitting} 
                className="px-6 py-2 text-sm font-bold text-white bg-[#11a4d4] hover:bg-[#0e8ab3] rounded-lg shadow-sm transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {isSubmitting ? 'Updating...' : 'Update MOA Record'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;