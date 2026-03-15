// src/pages/ViewMoaDetails.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BadgeCheck, 
  Building2, 
  User as UserIcon, 
  MapPin, 
  Mail, 
  ExternalLink, 
  Info, 
  Printer, 
  Download 
} from 'lucide-react';
import { useStore } from '../store/useStore';

const ViewMoaDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Pull the moas array from our global store
  const { moas } = useStore();

  // Find the specific MOA that matches the ID in the URL
  const targetMoa = moas.find(m => m.HTEID === id);

  // If the MOA doesn't exist (or was hard-deleted), show a fallback
  if (!targetMoa) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Partnership Not Found</h2>
        <p className="text-slate-500 text-sm">The requested MOA record could not be located in the system.</p>
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-[#11a4d4] text-white rounded-lg font-bold text-sm hover:bg-[#0e8ab3] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
      
      {/* Back Button */}
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-[#11a4d4] hover:gap-3 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Previous Page
        </button>
      </div>

      {/* Page Title Area */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Memorandum of Agreement Details</h2>
        <p className="text-slate-500 mt-1">Institutional record for approved industry partners.</p>
      </div>

      {/* Details Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        
        {/* Card Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
          <div className="bg-[#11a4d4]/10 text-[#11a4d4] p-3 rounded-lg">
            <BadgeCheck className="w-6 h-6" />
          </div>
          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide mb-1 ${
              targetMoa.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'
            }`}>
              {targetMoa.status} Agreement
            </span>
            <h3 className="font-bold text-xl text-slate-900">Official Partnership Profile</h3>
          </div>
        </div>

        {/* Card Body (Grid Layout) */}
        <div className="p-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            
            {/* Company Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Company Name
              </label>
              <p className="text-lg font-semibold text-slate-900">{targetMoa.companyName}</p>
            </div>

            {/* Contact Person */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Contact Person
              </label>
              <p className="text-lg font-semibold text-slate-900">{targetMoa.contactPerson}</p>
            </div>

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Company Address
              </label>
              <p className="text-lg font-medium text-slate-700 leading-relaxed">
                {targetMoa.address}
              </p>
            </div>

            {/* Email Address */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <a 
                href={`mailto:${targetMoa.email}`}
                className="text-lg font-semibold text-[#11a4d4] hover:text-[#0e8ab3] hover:underline underline-offset-4 flex items-center gap-2 w-fit transition-colors"
              >
                {targetMoa.email}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

          </div>
        </div>

        {/* Footer Warning Info */}
        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Info className="w-5 h-5 text-[#11a4d4] shrink-0" />
            <p>This information is for academic and internship coordination purposes only. Please handle data responsibly.</p>
          </div>
        </div>
      </div>

      {/* Print/Export Actions */}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 shadow-sm"
        >
          <Printer className="w-5 h-5" />
          Print Details
        </button>
        <button 
          onClick={handlePrint} // Triggers PDF save dialog on modern browsers
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 shadow-sm"
        >
          <Download className="w-5 h-5" />
          Save as PDF
        </button>
      </div>

    </div>
  );
};

export default ViewMoaDetails;