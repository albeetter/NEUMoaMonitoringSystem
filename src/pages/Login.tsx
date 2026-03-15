// src/pages/Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.isBlocked) {
        navigate('/access-denied');
      } else {
        if (user.role === 'admin') navigate('/admin-dashboard');
        else if (user.role === 'faculty') navigate('/faculty-dashboard');
        else navigate('/student-dashboard');
      }
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoggingIn(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Enforce NEU email validation
      if (!result.user.email?.endsWith('@neu.edu.ph')) {
        await signOut(auth); // Immediately sign them out
        setError('Unauthorized email. Please use your official @neu.edu.ph email address.');
        setIsLoggingIn(false);
        return;
      }

      // If successful, the AuthContext's onAuthStateChanged listener will catch it 
      // and update the user state, triggering the useEffect above to route them.

    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError(''); // Ignore if they just closed the popup
      } else {
        setError('Failed to sign in with Google. Please try again.');
      }
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="bg-[#f8f6f6] text-slate-900 min-h-screen flex flex-col font-sans">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        
        {/* Navbar */}
        <header className="absolute top-0 left-0 w-full p-6 md:p-8 flex items-center justify-start">
         {/* Your logo code here */}
             <div className="flex items-center gap-3">
                 <img 
                 src="/NEU Logo.svg"
                 alt="NEU Logo" 
                 className="w-8 h-8 object-contain" 
                 />
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">NEU MOA Portal</h1>
             </div>
            </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col justify-center items-center py-10 px-4">
          <div className="text-center mb-10 max-w-[600px]">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
              MOA Monitoring App
            </h1>
          </div>

          <div className="flex flex-col max-w-[480px] w-full bg-white shadow-2xl rounded-xl overflow-hidden border border-slate-200">
            <div className="p-8 flex flex-col">
              

              {/* Login Action */}
              <div className="flex flex-col gap-4 mb-8">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 text-sm text-center">
                    {error}
                  </div>
                )}

                <button 
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 bg-[#11a4d4] text-white gap-3 transition-all duration-200 shadow-lg shadow-blue-500/20 hover:bg-[#11a4d4]/90 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#fff"></path>
                  </svg>
                  <span className="text-base font-bold leading-normal tracking-wide">
                    {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
                  </span>
                </button>
              </div>

              {/* Footer Info */}
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500 font-medium">Internal Use Only</span>
                  </div>
                </div>
                <div className="bg-[#11a4d4]/5 rounded-lg p-4 border border-[#11a4d4]/20 text-center text-[#11a4d4] text-xs leading-normal">
                    Access is restricted to authorized administrative personnel. By signing in, you agree to the University's Terms of Service and Data Privacy Policy.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Footer */}
        <footer className="p-6 text-center mt-auto">
          <p className="text-slate-400 text-xs font-medium">
            © 2026 NEU Memorandum of Agreement Management System. All Rights Reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Login;