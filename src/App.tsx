import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import AccessDenied from './pages/AccessDenied';
import Dashboard from './pages/Dashboard'; 
import MoaManagement from './pages/MoaManagement';
import UserManagement from './pages/UserManagement';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AuditTrail from './pages/AuditTrail';
import DataRecovery from './pages/DataRecovery';
import Settings from './pages/Settings';
import ViewMoaDetails from './pages/ViewMoaDetails'; 

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/access-denied" element={<AccessDenied />} />

          <Route element={<MainLayout />}>
            
            {/* Admin Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin-dashboard" element={<Dashboard />} />
              <Route path="/user-management" element={<UserManagement />} />
              <Route path="/audit-trail" element={<AuditTrail />} />
              <Route path="/data-recovery" element={<DataRecovery />} />
            </Route>

            {/* Faculty Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={['faculty']} />}>
              <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
            </Route>

            {/* Faculty & Admin Shared Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'faculty']} />}>
              <Route path="/moa-management" element={<MoaManagement />} />
            </Route>

            {/* Shared Routes for EVERYONE (Admin, Faculty, Student) */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'faculty', 'student']} />}>
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/moa-details/:id" element={<ViewMoaDetails />} />
            </Route>

          </Route>

          {/* This is the Catch-All that was bouncing you to the login page! */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;