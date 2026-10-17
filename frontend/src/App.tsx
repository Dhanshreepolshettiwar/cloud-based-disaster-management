import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { CitizenPortal } from './pages/CitizenPortal';
import { AuthorityDashboard } from './pages/AuthorityDashboard';
import { RescueConsole } from './pages/RescueConsole';
import { SheltersPage } from './pages/SheltersPage';
import { AdminPanel } from './pages/AdminPanel';
import { SOSModal } from './components/SOSModal';
import { ReportModal } from './components/ReportModal';

export const AppContent: React.FC = () => {
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Navbar onOpenSOS={() => setIsSOSOpen(true)} onOpenReport={() => setIsReportOpen(true)} />

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <CitizenPortal
                onOpenSOS={() => setIsSOSOpen(true)}
                onOpenReport={() => setIsReportOpen(true)}
              />
            }
          />
          <Route path="/authority" element={<AuthorityDashboard />} />
          <Route path="/rescue" element={<RescueConsole />} />
          <Route path="/shelters" element={<SheltersPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="bg-slate-950 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            DisasterGuard Cloud Platform • Built for AWS Serverless Architecture
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Amazon Cognito</span>
            <span>•</span>
            <span>API Gateway</span>
            <span>•</span>
            <span>AWS Lambda</span>
            <span>•</span>
            <span>DynamoDB</span>
            <span>•</span>
            <span>Amazon S3</span>
            <span>•</span>
            <span>Amazon SNS</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <SOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
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
