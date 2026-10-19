import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CitizenPortal } from './pages/CitizenPortal';
import { AuthorityDashboard } from './pages/AuthorityDashboard';
import { RescueConsole } from './pages/RescueConsole';
import { SheltersPage } from './pages/SheltersPage';
import { AdminPanel } from './pages/AdminPanel';
import { LoginPage } from './pages/LoginPage';
import { SOSModal } from './components/SOSModal';
import { ReportModal } from './components/ReportModal';
import { ERSSModal } from './components/ERSSModal';
import { RegionalScenarioId, Language } from './types';
import { apiService } from './services/api';

export const AppContent: React.FC = () => {
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isERSSOpen, setIsERSSOpen] = useState(false);

  const [currentScenario, setCurrentScenario] = useState<RegionalScenarioId>(() => {
    return apiService.getActiveScenario().id;
  });

  const [language, setLanguage] = useState<Language>('en');

  const handleScenarioChange = (scenarioId: RegionalScenarioId) => {
    apiService.setActiveScenario(scenarioId);
    setCurrentScenario(scenarioId);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased selection:bg-red-600 selection:text-white">
      <Navbar
        onOpenSOS={() => setIsSOSOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenERSS={() => setIsERSSOpen(true)}
        currentScenario={currentScenario}
        onScenarioChange={handleScenarioChange}
        language={language}
        onLanguageChange={setLanguage}
      />

      <main className="flex-1 pb-10">
        <Routes>
          {/* Public Portal */}
          <Route
            path="/"
            element={
              <CitizenPortal
                onOpenSOS={() => setIsSOSOpen(true)}
                onOpenReport={() => setIsReportOpen(true)}
                currentScenario={currentScenario}
                onScenarioChange={handleScenarioChange}
                language={language}
              />
            }
          />

          {/* Authentication Page */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Authority Operations Command */}
          <Route
            path="/authority"
            element={
              <ProtectedRoute allowedRoles={['AUTHORITY', 'ADMIN']}>
                <AuthorityDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Field Responder Rescue Console */}
          <Route
            path="/rescue"
            element={
              <ProtectedRoute allowedRoles={['RESCUE_TEAM', 'AUTHORITY', 'ADMIN']}>
                <RescueConsole />
              </ProtectedRoute>
            }
          />

          {/* Shelters & Resources Directory */}
          <Route path="/shelters" element={<SheltersPage />} />

          {/* Protected System Admin Panel */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminPanel
                  currentScenario={currentScenario}
                  onScenarioChange={handleScenarioChange}
                />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <div className="font-bold text-slate-300">
              DisasterGuard India • Cloud-Native Disaster Management Coordination
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Reference Standards: Emergency Response Support System (ERSS - Dial 112) & NDMA Guidelines
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400">
            <span>Amazon Cognito (RBAC)</span>
            <span>•</span>
            <span>API Gateway</span>
            <span>•</span>
            <span>AWS Lambda</span>
            <span>•</span>
            <span>Amazon DynamoDB</span>
            <span>•</span>
            <span>Amazon S3</span>
            <span>•</span>
            <span>Amazon SNS</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
      <ERSSModal isOpen={isERSSOpen} onClose={() => setIsERSSOpen(false)} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
