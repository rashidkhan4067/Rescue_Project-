import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import DashboardTopbar from '../components/dashboard/DashboardTopbar';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import AiScannerModal from '../components/dashboard/AiScannerModal';
import BroadcastModal from '../components/dashboard/BroadcastModal';
import AiRescueAssistant from '../components/dashboard/AiRescueAssistant';

function DashboardLayout({ 
  children, 
  activeTab, 
  setActiveTab, 
  broadcastActive, 
  setBroadcastActive,
  searchQuery,
  setSearchQuery
}) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Mobile Drawer State
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global overlay triggers
  const [showAiScanner, setShowAiScanner] = useState(false);
  const [aiScanStage, setAiScanStage] = useState('idle');
  const [aiMatchScore, setAiMatchScore] = useState(0);

  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastArea, setBroadcastArea] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const triggerAiScan = () => {
    setAiScanStage('scanning');
    setAiMatchScore(0);
    setShowAiScanner(true);
    setTimeout(() => {
      setAiScanStage('complete');
      setAiMatchScore(Math.floor(Math.random() * (99 - 88 + 1)) + 88);
    }, 2800);
  };

  const handleLaunchBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastArea) return;
    if (setBroadcastActive) {
      setBroadcastActive(true);
    }
    setShowBroadcastModal(false);
    alert(`🚨 Emergency Broadcast Beacon launched successfully to coordinates: ${broadcastArea}`);
  };

  return (
    <div className="portal-layout-container">
      
      {/* 1. Global Administrative Sticky Topbar Header */}
      <DashboardTopbar 
        user={user}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="portal-workspace">
        {/* 2. Global Administrative Left Sidebar Drawer (Responsive state bound) */}
        <DashboardSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          onLogout={handleLogout}
          onOpenAiScanner={triggerAiScan}
          onOpenBroadcast={() => setShowBroadcastModal(true)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* 3. Main Dashboard Operative Viewport */}
        <div className="portal-content-panel">
          {children}
        </div>
      </div>

      {/* Dynamic Global AI Scanner overlay */}
      <AiScannerModal 
        isOpen={showAiScanner}
        onClose={() => setShowAiScanner(false)}
        scanStage={aiScanStage}
        matchScore={aiMatchScore}
        triggerScan={triggerAiScan}
      />

      {/* Dynamic Global Broadcast overlay */}
      <BroadcastModal 
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        broadcastArea={broadcastArea}
        setBroadcastArea={setBroadcastArea}
        onLaunchBroadcast={handleLaunchBroadcast}
      />

      {/* Global AI Rescue Chat Assistant Collapsible Widget */}
      <AiRescueAssistant />

    </div>
  );
}

export default DashboardLayout;
