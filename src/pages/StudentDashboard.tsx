// src/pages/StudentDashboard.tsx
import React, { useState } from 'react';
import { Search, Building2, ExternalLink } from 'lucide-react';
import { useStore, MoaStatus } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const [industryFilter, setIndustryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pull real MOA data from the global store
  const { moas } = useStore();
  const navigate = useNavigate();

  // SECURITY: Students should ONLY see active, non-deleted partnerships
  const activeMoas = moas.filter(moa => !moa.isDeleted && moa.status === MoaStatus.ACTIVE);

  // Dynamically generate the industry dropdown list based on actual active MOAs
  const uniqueIndustries = Array.from(new Set(activeMoas.map(m => m.industryType)))
    .filter(Boolean)
    .sort();

  // Apply search and industry filters
  const displayedMoas = activeMoas.filter(moa => {
    const matchesSearch = 
      moa.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      moa.industryType.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesIndustry = industryFilter === '' || moa.industryType === industryFilter;
    
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto">
      
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Approved MOA Directory</h2>
        <p className="text-slate-600 mt-1">Browse and search for partner industries with active Memorandums of Agreement.</p>
      </div>

      {/* Search & Filter */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Dynamic Industry Filter */}
          <div className="flex flex-col gap-2">
            <label htmlFor="filter-industry" className="text-sm font-semibold text-slate-700">
              Filter by Industry
            </label>
            <select 
              id="filter-industry" 
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="block w-full border border-slate-300 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-[#11a4d4] outline-none transition-all shadow-sm text-sm cursor-pointer"
            >
              <option value="">All Industries</option>
              {uniqueIndustries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          {/* Company Name Search */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <label htmlFor="search-company" className="text-sm font-semibold text-slate-700">
              Search Company Name
            </label>
            <div className="relative flex items-center">
              <input 
                id="search-company" 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter company name or industry..." 
                className="block w-full border border-slate-300 rounded-lg pl-4 pr-32 py-2.5 bg-white focus:ring-2 focus:ring-[#11a4d4] outline-none transition-all shadow-sm text-sm"
              />
              <button className="absolute right-1.5 bg-[#11a4d4] text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-[#0e8ab3] transition-colors shadow-sm flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Approved MOA List */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-semibold text-slate-800">Available Partnerships</h3>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
            Status: Approved
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Company Name
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Address
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Contact Details
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {displayedMoas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-base font-medium text-slate-900">No active partnerships found.</p>
                    <p className="text-sm mt-1">Check back later or adjust your search filters.</p>
                  </td>
                </tr>
              ) : (
                displayedMoas.map((moa) => (
                  <tr key={moa.HTEID} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Company Cell */}
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">{moa.companyName}</div>
                      <div className="text-xs text-[#11a4d4] font-medium mt-0.5">{moa.industryType}</div>
                    </td>
                    
                    {/* Address Cell */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 max-w-sm" title={moa.address}>
                        {moa.address}
                      </div>
                    </td>
                    
                    {/* Contact Cell */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 font-medium">{moa.contactPerson}</div>
                      <a 
                        href={`mailto:${moa.email}`} 
                        className="text-sm text-[#11a4d4] hover:underline hover:text-[#0e8ab3] transition-colors block mt-0.5"
                      >
                        {moa.email}
                      </a>
                    </td>
                    
                    {/* Actions Cell */}
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/moa-details/${moa.HTEID}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#11a4d4]/10 text-[#11a4d4] hover:bg-[#11a4d4] hover:text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        View Profile
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-900">{displayedMoas.length > 0 ? 1 : 0}</span> to{' '}
            <span className="font-medium text-slate-900">{displayedMoas.length}</span> of{' '}
            <span className="font-medium text-slate-900">{activeMoas.length}</span> active partners
          </div>
          <div className="flex gap-2">
            <button disabled className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-400 bg-white shadow-sm cursor-not-allowed">
              Previous
            </button>
            <button disabled={displayedMoas.length === 0} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>

      </section>
    </div>
  );
};

export default StudentDashboard;