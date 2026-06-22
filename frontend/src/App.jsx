import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuthStore } from './store/useAuthStore';
import './index.css';

// Components
import MainLayout from './layouts/MainLayout';

// Pages grouped by domain subdirectories
import LandingPage from './pages/landing/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyMagicLink from './pages/auth/VerifyMagicLink';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/dashboard/Profile';
import Search from './pages/dashboard/Search';
import Alerts from './pages/dashboard/Alerts';
import CaseDetailsPage from './pages/cases/CaseDetailsPage';
import CreateCasePage from './pages/cases/CreateCasePage';
import BulletinPage from './pages/cases/BulletinPage';
import Report from './pages/cases/Report';
import AiMatcherPage from './pages/diagnostics/AiMatcherPage';
import AnalyticsPage from './pages/diagnostics/AnalyticsPage';
import LiveMapPage from './pages/mobilization/LiveMapPage';
import VolunteersPage from './pages/mobilization/VolunteersPage';

// Help & Support pages
import EmergencyContactsPage from './pages/help/EmergencyContactsPage';
import GuidePage from './pages/help/GuidePage';
import FaqPage from './pages/help/FaqPage';
import UpdatesPage from './pages/help/UpdatesPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();
  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

// Admin Protected Route Wrapper
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuthStore();
  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!user?.is_admin) return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  return (
    <GoogleOAuthProvider clientId="85150991062-jugsr38unm8vmfkgt0c2errcn9r2bc7m.apps.googleusercontent.com">
      <Router>
        <div className="app-container">
          <Routes>
            {/* Landing page wrapped in MainLayout */}
            <Route path="/" element={<MainLayout><LandingPage /></MainLayout>} />
            
            {/* Auth pages (No global Navbar/Footer for a focused screen experience) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-magic-link" element={<VerifyMagicLink />} />
            
            {/* User Dashboard & Alerts pages */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/create-case" element={<ProtectedRoute><CreateCasePage /></ProtectedRoute>} />
            <Route path="/ai-matcher" element={<ProtectedRoute><AiMatcherPage /></ProtectedRoute>} />
            <Route path="/case/:id" element={<ProtectedRoute><CaseDetailsPage /></ProtectedRoute>} />
            <Route path="/volunteers" element={<ProtectedRoute><VolunteersPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/map" element={<ProtectedRoute><LiveMapPage /></ProtectedRoute>} />
            <Route path="/bulletin" element={<ProtectedRoute><BulletinPage /></ProtectedRoute>} />
            
            {/* Help & Support routes */}
            <Route path="/contacts" element={<ProtectedRoute><EmergencyContactsPage /></ProtectedRoute>} />
            <Route path="/guide" element={<ProtectedRoute><GuidePage /></ProtectedRoute>} />
            <Route path="/faq" element={<ProtectedRoute><FaqPage /></ProtectedRoute>} />
            <Route path="/updates" element={<ProtectedRoute><UpdatesPage /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
