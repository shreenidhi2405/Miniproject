import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { OverviewView } from './components/views/OverviewView';
import { LogExplorerView } from './components/views/LogExplorerView';
import { ThreatDetectionView } from './components/views/ThreatDetectionView';
import { AttackCorrelationView } from './components/views/AttackCorrelationView';
import { ThreatMemoryView } from './components/views/ThreatMemoryView';
import { DataMiningView } from './components/views/DataMiningView';
import { AIAnalyticsView } from './components/views/AIAnalyticsView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';
import { api } from './services/api';
import { OverviewStats } from './types';
import { AlertCircle } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeIncidentsCount, setActiveIncidentsCount] = useState<number>(0);
  const [emergingPatternsCount, setEmergingPatternsCount] = useState<number>(0);

  const fetchGlobalData = async () => {
    setIsLoading(true);
    try {
      const stats = await api.getOverview();
      setOverviewStats(stats);
      setActiveIncidentsCount(stats.critical_incidents + stats.high_incidents);

      // Fetch memory patterns count for sidebar badge
      const patterns = await api.getThreatPatterns(undefined, true);
      setEmergingPatternsCount(patterns.length);
    } catch (e) {
      console.error('Failed to fetch global metrics:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070b14] text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeIncidentsCount={activeIncidentsCount}
        emergingPatternsCount={emergingPatternsCount}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <Topbar
          onRefresh={fetchGlobalData}
          isLoading={isLoading}
          totalEvents={overviewStats?.total_events || 0}
          engineMode={overviewStats?.processing_engine || 'Accelerated Local Engine'}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <OverviewView
              stats={overviewStats}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'logs' && (
            <LogExplorerView onRefreshGlobal={fetchGlobalData} />
          )}

          {activeTab === 'detection' && (
            <ThreatDetectionView />
          )}

          {activeTab === 'correlation' && (
            <AttackCorrelationView />
          )}

          {activeTab === 'memory' && (
            <ThreatMemoryView />
          )}

          {activeTab === 'mining' && (
            <DataMiningView />
          )}

          {activeTab === 'analytics' && (
            <AIAnalyticsView onRefreshGlobal={fetchGlobalData} />
          )}

          {activeTab === 'reports' && (
            <ReportsView />
          )}

          {activeTab === 'settings' && (
            <SettingsView onRefreshGlobal={fetchGlobalData} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
