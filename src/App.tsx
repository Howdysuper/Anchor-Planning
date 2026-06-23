/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ToastProvider } from './contexts/ToastContext';
import Onboarding from './components/Onboarding';
import ImmersiveDashboard from './components/ImmersiveDashboard';
import AppLayout from './components/AppLayout';

import AnchorPoints from './components/AnchorPoints';
import Loadout from './components/Loadout';
import BrainDump from './components/BrainDump';
import QuestLog from './components/QuestLog';
import SleepIntel from './components/SleepIntel';
import Leaderboard from './components/Leaderboard';
import Settings from './components/Settings';
import { useApp } from './contexts/AppContext';

function AppContent() {
  const { state } = useApp();
  const { user, loading } = useAuth();
  
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('anchor_onboarded') === 'true';
  });

  useEffect(() => {
    const handleStorage = () => setIsOnboarded(localStorage.getItem('anchor_onboarded') === 'true');
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-[#0A0A0A] text-[#F0F0F0]">Loading...</div>;
  }

  // If not logged in, or not fully onboarded, show Onboarding
  if (!user || !isOnboarded) {
    return <Onboarding onComplete={() => setIsOnboarded(true)} />;
  }

  const renderPage = () => {
    switch (state.currentPage) {
      case 'dashboard': return <ImmersiveDashboard />;
      case 'anchors': return <AnchorPoints />;
      case 'loadout': return <Loadout />;
      case 'braindump': return <BrainDump />;
      case 'quests': return <QuestLog />;
      case 'sleep': return <SleepIntel />;
      case 'leaderboard': return <Leaderboard />;
      case 'settings': return <Settings />;
      default: return <ImmersiveDashboard />;
    }
  };

  return (
    <AppLayout>
      {renderPage()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppProvider>
          <SettingsProvider>
            <AppContent />
          </SettingsProvider>
        </AppProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

