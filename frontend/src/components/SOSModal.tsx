import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  MapPin,
  Users,
  Phone,
  CheckCircle,
  Navigation,
  HeartPulse,
  UploadCloud,
  PhoneCall,
  WifiOff,
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SOSRequest } from '../types';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const SOSModal: React.FC<SOSModalProps> = ({ isOpen, onClose, onSubmitted }) => {
  const { currentUser } = useAuth();
  const activeScenario = apiService.getActiveScenario();

  const [emergencyType, setEmergencyType] = useState('Trapped by floodwaters');
  const [locationDescription, setLocationDescription] = useState('');
  const [latitude, setLatitude] = useState<number>(activeScenario.center[0]);
  const [longitude, setLongitude] = useState<number>(activeScenario.center[1]);
  const [peopleCount, setPeopleCount] = useState<number>(2);
  const [phone, setPhone] = useState(currentUser?.phoneNumber || '');
  const [notes, setNotes] = useState('');
  const [specialNeeds, setSpecialNeeds] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    request: SOSRequest;
    queuedOffline: boolean;
  } | null>(null);

  // Lock background scroll when open & listen for Escape
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleResetAndClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSpecialNeed = (need: string) => {
    setSpecialNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  };

  const handleDetectLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(6)));
        setLongitude(Number(pos.coords.longitude.toFixed(6)));
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
        setLocationError(
          'Location access was denied or timed out. Please enter your address or nearest landmark below.'
        );
      },
      { timeout: 9000, enableHighAccuracy: true }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationDescription.trim()) {
      alert('Please describe your location or nearest landmark.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedFile) {
        try {
          await apiService.getPresignedUploadUrl(
            selectedFile.name,
            selectedFile.type,
            selectedFile.size
          );
        } catch (uploadErr) {
          console.warn('Upload fallback:', uploadErr);
        }
      }

      const result = await apiService.submitSOS(
        {
          emergencyType,
          locationDescription,
          latitude,
          longitude,
          district: activeScenario.name.split(',')[0],
          state: activeScenario.state,
          peopleCount,
          requesterPhone: phone,
          specialNeeds,
          notes,
          urgency: 'Critical',
        },
        currentUser ? currentUser.name : 'Citizen'
      );

      setIsSubmitting(false);
      setSubmissionResult(result);
      if (onSubmitted) onSubmitted();
    } catch (err: any) {
      setIsSubmitting(false);
      alert(`Submission error: ${err.message || 'Failed to submit SOS'}`);
    }
  };

  const handleResetAndClose = () => {
    setSubmissionResult(null);
    setSelectedFile(null);
    setFilePreview(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleResetAndClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 border border-red-500/40 rounded-2xl max-w-xl w-full max-h-[92vh] sm:max-h-[88vh] shadow-2xl flex flex-col relative text-slate-800 dark:text-slate-100 overflow-hidden transition-colors">
        {/* Top Emergency Indicator Banner */}
        <div className="h-2 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 shrink-0" />

        {/* Pinned Sticky Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-between bg-slate-50/90 dark:bg-slate-900/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-500 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 id="sos-modal-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Emergency SOS Distress Beacon
              </h3>
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold">Priority Incident Response Logging</p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 overscroll-contain">
          {/* Real life warning callout */}
          <div className="bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-500/50 p-3.5 rounded-xl text-xs text-red-900 dark:text-red-200 flex items-start gap-3">
            <PhoneCall className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-red-950 dark:text-white">GENUINE LIFE EMERGENCY? DIAL 112 IMMEDIATELY.</span>
              <p className="text-[11px] text-red-800 dark:text-red-300 mt-0.5">
                This web form logs your distress coordinates into the coordination platform. It does NOT replace calling India's emergency helpline 112 directly.
              </p>
            </div>
          </div>

          {submissionResult ? (
            /* Submission Outcome Screen */
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {submissionResult.queuedOffline ? 'SOS Stored in Local Queue' : 'Distress Beacon Logged Successfully'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Reference ID: <strong className="text-amber-600 dark:text-amber-400 font-mono">{submissionResult.request.sosId}</strong>
                </p>
              </div>

              {submissionResult.queuedOffline ? (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-600/40 p-3 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Saved to your browser's offline queue. It will automatically sync when connectivity is restored.</span>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Emergency Type:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{submissionResult.request.emergencyType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">People At Risk:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{submissionResult.request.peopleCount} persons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Coordinates:</span>
                    <span className="font-mono text-slate-900 dark:text-white text-[11px]">
                      {submissionResult.request.latitude.toFixed(4)}, {submissionResult.request.longitude.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Platform Status:</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                      {submissionResult.request.status}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-200">Next Steps:</span>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li>Stay in safe, elevated shelter and avoid entering floodwater.</li>
                  <li>Keep your mobile phone on battery saver mode.</li>
                  <li>Inform neighbors of your location.</li>
                </ul>
              </div>
            </div>
          ) : (
            /* SOS Entry Form */
            <form id="sos-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Category / Nature of Distress */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Emergency Situation <span className="text-red-500">*</span>
                </label>
                <select
                  value={emergencyType}
                  onChange={(e) => setEmergencyType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                >
                  <option value="Trapped by floodwaters">Trapped by floodwaters (Water rising rapidly)</option>
                  <option value="Severe waterlogging - Elderly / Patient evacuation">Severe waterlogging - Elderly / Patient evacuation</option>
                  <option value="Wall / Ceiling Collapse risk">Wall / Ceiling Collapse risk</option>
                  <option value="Submerged vehicle stalling in deep water">Submerged vehicle stalling in deep water</option>
                  <option value="Electrical shock hazard / Fallen live powerline">Electrical shock hazard / Fallen live powerline</option>
                  <option value="Landslide debris trapping access road">Landslide debris trapping access road</option>
                  <option value="Other immediate life hazard">Other immediate life hazard</option>
                </select>
              </div>

              {/* People count & Contact phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    People Needing Help <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={peopleCount}
                      onChange={(e) => setPeopleCount(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Contact Phone (+91) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98200 XXXXX"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Vulnerabilities & Special Assistance */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                  <span>Special Assistance Needed:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {[
                    'Infants / Small Children',
                    'Elderly / Bedridden Citizen',
                    'Urgent Medical / Oxygen Support',
                    'Wheelchair / Mobility Impairment',
                    'Need Drinking Water & Food',
                  ].map((need) => (
                    <label
                      key={need}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
                        specialNeeds.includes(need)
                          ? 'bg-red-500/15 border-red-500/60 text-red-950 dark:text-white font-semibold'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={specialNeeds.includes(need)}
                        onChange={() => toggleSpecialNeed(need)}
                        className="rounded border-slate-300 dark:border-slate-700 text-red-600 focus:ring-0"
                      />
                      <span>{need}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location & GPS Detection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">
                    Location & Nearest Landmark <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'Detecting GPS...' : 'Auto-Detect GPS'}</span>
                  </button>
                </div>

                <textarea
                  value={locationDescription}
                  onChange={(e) => setLocationDescription(e.target.value)}
                  placeholder="e.g., Room 14, 2nd floor, opposite Kurla West Railway Station / Near Gandhi Market..."
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                  required
                />

                {locationError && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">{locationError}</p>
                )}

                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <MapPin className="w-3 h-3 text-red-500" />
                  <span>GPS: {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E</span>
                </div>
              </div>

              {/* Optional Photo Attachment */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <UploadCloud className="w-3.5 h-3.5 text-amber-500" />
                  <span>Optional Water / Scene Photo</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-200 dark:file:bg-slate-800 file:text-slate-800 dark:file:text-slate-200 hover:file:bg-slate-300 dark:hover:file:bg-slate-700 cursor-pointer"
                />
                {filePreview && (
                  <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700">
                    <img src={filePreview} alt="Damage Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Additional notes */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Additional Situational Details
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Water is above knee level; 2 pets also in room"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </form>
          )}
        </div>

        {/* Pinned Sticky Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/90 dark:bg-slate-900/95 flex items-center justify-between gap-3">
          {submissionResult ? (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow transition"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                Dispatches immediately to Rescue Command
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="sos-form"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold shadow-lg shadow-red-600/30 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Transmitting Beacon...' : 'TRANSMIT SOS BEACON'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
