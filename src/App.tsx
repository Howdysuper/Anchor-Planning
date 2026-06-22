/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('anchor_onboarded') === 'true';
  });

  if (!isOnboarded) {
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

