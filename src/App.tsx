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

import Loadout from './components/Loadout';
import BrainDump from './components/BrainDump';
import QuestLog from './components/QuestLog';
import Leaderboard from './components/Leaderboard';
import Settings from './components/Settings';
import StatisticsPage from './components/StatisticsPage';
import { useApp } from './contexts/AppContext';
import LoadingScreen from './components/LoadingScreen';

function AppContent() {
  const { state } = useApp();
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }

  // Determine onboarding status per user
  const isOnboarded = !!(user && (state.user?.onboarded === true || localStorage.getItem(`anchor_onboarded_${user.uid}`) === 'true'));

  // If not logged in, or not fully onboarded, show Onboarding
  if (!user || !isOnboarded) {
    return (
      <Onboarding 
        onComplete={() => {
          if (user) {
            localStorage.setItem(`anchor_onboarded_${user.uid}`, 'true');
          }
        }} 
      />
    );
  }

  const renderPage = () => {
    switch (state.currentPage) {
      case 'dashboard': return <ImmersiveDashboard />;
      case 'loadout': return <Loadout />;
      case 'braindump': return <BrainDump />;
      case 'quests': return <QuestLog />;
      case 'sleep': return <StatisticsPage />;
      case 'sleep-overview': return <StatisticsPage defaultTab="sleep-overview" />;
      case 'leaderboard': return <Leaderboard />;
      case 'stats': return <StatisticsPage />;
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

