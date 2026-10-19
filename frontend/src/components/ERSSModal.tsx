import React from 'react';
import { X, PhoneCall, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';

interface ERSSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ERSSModal: React.FC<ERSSModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden text-slate-200">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500" />

        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Emergency Response Support System (ERSS)
              </h3>
              <p className="text-xs text-red-400 font-semibold">Pan-India Single Emergency Helpline: 112</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Integrated Emergency Number for All Indian States & UTs
            </div>
            <p>
              In India, <strong>112</strong> is the unified emergency response helpline powered by the Ministry of Home Affairs (MHA). It connects callers to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
              <li><strong>Police (100)</strong> — Law & order and rescue dispatch</li>
              <li><strong>Fire & Rescue (101)</strong> — Structural collapses, fires, boat rescues</li>
              <li><strong>Ambulance (102 / 108)</strong> — Medical triage and trauma transit</li>
              <li><strong>Disaster Management (1070 / 1077)</strong> — SDMA & DDMA flood evacuation</li>
            </ul>
          </div>

          {/* Official Verification Notice */}
          <div className="bg-amber-950/40 border border-amber-600/40 p-3.5 rounded-xl text-amber-200 space-y-1.5">
            <div className="font-bold text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Platform Transparency & Demonstration Disclaimer
            </div>
            <p className="text-[11px] leading-normal text-amber-200/90">
              DisasterGuard is an independent cloud simulation and disaster management coordination tool. While it replicates real command workflows, <strong>submitting an SOS or Incident form inside this demonstration portal does NOT automatically dispatch government responders</strong>.
            </p>
            <p className="text-[11px] font-bold text-amber-300">
              If life or property is in genuine immediate peril, DIAL 112 directly on your mobile or landline phone.
            </p>
          </div>

          {/* Official Reference Links */}
          <div className="space-y-2 pt-1">
            <div className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">
              Official Indian Emergency References:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <a
                href="https://112.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-blue-400 transition"
              >
                <span>112 India (ERSS Portal)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://sachet.ndma.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-blue-400 transition"
              >
                <span>NDMA SACHET Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.mha.gov.in/en/commoncontent/emergency-response-support-system-erss"
                target="_blank"
                rel="noopener noreferrer"
                className="sm:col-span-2 flex items-center justify-between p-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-blue-400 transition"
              >
                <span>Ministry of Home Affairs ERSS Architecture Documentation</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-600 transition"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
