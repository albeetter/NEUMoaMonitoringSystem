// src/pages/AccessDenied.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AccessDenied: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Clear session on mount if they land here
  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-red-100 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          !
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-600 mb-8 text-sm">
          Your account has been temporarily blocked from accessing the NEU MOA Portal. Please contact the system administrator for assistance.
        </p>
        <button 
          onClick={() => navigate('/login')}
          className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
};

export default AccessDenied;