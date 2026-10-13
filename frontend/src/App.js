import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const CitizenPortal = lazy(() => import('./pages/CitizenPortal'));
const WorkerPortal = lazy(() => import('./pages/WorkerPortal'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PriorityQueue = lazy(() => import('./pages/PriorityQueue'));
const ReportDetails = lazy(() => import('./pages/ReportDetails'));
const Announcements = lazy(() => import('./components/Announcements'));
const AuthorityContacts = lazy(() => import('./pages/AuthorityContacts'));

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
      <main className="page-shell"><Suspense fallback={<div className="container py-5 text-center" role="status">Loading page…</div>}><Routes>
        <Route path="/" element={<Home />} />
        <Route path="/notices" element={<Announcements />} />
        <Route path="/contacts" element={<AuthorityContacts />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
      </Routes></Suspense></main>
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
