import React from 'react';
import { Mail, Shield, Book, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings: React.FC = () => {
  // Pull the current user's data from our Firebase Auth context
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-slate-900 text-3xl font-black tracking-tight">Account Settings</h1>
        <p className="text-slate-500 text-base">View your profile details and system permissions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-center">
            <div className="h-24 bg-[#11a4d4]/10 w-full relative"></div>
            <div className="px-6 pb-6 relative">
              <div className="w-20 h-20 bg-white rounded-full mx-auto -mt-10 mb-3 flex items-center justify-center p-1 shadow-sm border border-slate-100">
                {user.photoURL ? (
                     <img 
                         src={user.photoURL} 
                         alt="Profile" 
                         className="w-full h-full rounded-full object-cover"
                         referrerPolicy="no-referrer"
                            />
                        ) : (
                        <div className="w-full h-full bg-[#11a4d4] rounded-full flex items-center justify-center text-white text-3xl font-bold uppercase">
                        {user.name.charAt(0)}
                        </div>
                        )}
              </div>
              <h2 className="text-lg font-bold text-slate-900">{user.name}</h2>
              <p className="text-sm text-slate-500 font-medium capitalize">{user.role} Account</p>
              
              <div className="mt-6 flex flex-col gap-3 text-left">
                <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span className="capitalize">Role: {user.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Information & Preferences */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Security & Access */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-[#11a4d4]" />
              Security & Access
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <div>
                  <p className="font-bold text-slate-700">Authentication Method</p>
                  <p className="text-slate-500">Managed via Google Workspace (@neu.edu.ph)</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">Secure</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <div>
                  <p className="font-bold text-slate-700">Account Status</p>
                  <p className="text-slate-500">{user.isBlocked ? 'Temporarily Suspended' : 'Active & Verified'}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4 italic">
              Note: Passwords and 2FA are managed directly through your Google account settings, not within this application.
            </p>
          </div>

          {/* System Guidelines */}
          <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6 text-slate-300">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Book className="w-5 h-5 text-[#11a4d4]" />
              System Guidelines
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="text-[#11a4d4] font-bold">•</span>
                <span><strong>Data Privacy:</strong> All MOA documents and contact details are strictly confidential and for internal university use only.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#11a4d4] font-bold">•</span>
                <span><strong>Status Accuracy:</strong> Ensure that MOA statuses are updated promptly as they move through the Legal and VPAA pipelines.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#11a4d4] font-bold">•</span>
                <span><strong>Support:</strong> If you encounter issues or require elevated permissions, please contact the IT Administrator.</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;