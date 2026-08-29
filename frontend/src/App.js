import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AadharVerification from './pages/AadharVerification';
import AdminRegistration from './pages/AdminRegistration';
import CitizenPortal from './pages/CitizenPortal';
import WorkerPortal from './pages/WorkerPortal';
import AdminDashboard from './pages/AdminDashboard';
import PriorityQueue from './pages/PriorityQueue';
import ReportDetails from './pages/ReportDetails';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <div className="container mt-5"><h3>Access Denied</h3></div>;
  
  return children;
};

const AppContent = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/aadhar-verify" element={<AadharVerification />} />
        <Route path="/admin-register" element={<AdminRegistration />} />
        
        <Route path="/citizen" element={
          <ProtectedRoute allowedRole="CITIZEN">
            <CitizenPortal />
          </ProtectedRoute>
        } />
        
        <Route path="/reports/:id" element={
          <ProtectedRoute>
            <ReportDetails />
          </ProtectedRoute>
        } />
        
        <Route path="/worker" element={
          <ProtectedRoute allowedRole="WORKER">
            <WorkerPortal />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/priority" element={
          <ProtectedRoute allowedRole="ADMIN">
            <PriorityQueue />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
