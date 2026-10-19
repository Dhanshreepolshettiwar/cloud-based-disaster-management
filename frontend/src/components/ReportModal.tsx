import React, { useState, useEffect } from 'react';
import { X, Flame, MapPin, UploadCloud, CheckCircle, Navigation, Users } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DisasterCategory, SeverityLevel, Incident } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmitted }) => {
  const { currentUser } = useAuth();
  const activeScenario = apiService.getActiveScenario();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DisasterCategory>('Waterlogging');
  const [severity, setSeverity] = useState<SeverityLevel>('High');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [district, setDistrict] = useState(activeScenario.name.split(',')[0]);
  const [state, setState] = useState(activeScenario.state);
  const [latitude, setLatitude] = useState(activeScenario.center[0]);
  const [longitude, setLongitude] = useState(activeScenario.center[1]);
  const [peopleAffected, setPeopleAffected] = useState<number>(0);
  const [reporterContact, setReporterContact] = useState(currentUser?.phoneNumber || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [createdIncident, setCreatedIncident] = useState<Incident | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
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
        setLocationError('Could not determine GPS coordinates. Enter address manually.');
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !locationName.trim()) {
      alert('Please fill out all required fields marked with *');
      return;
    }

    setIsSubmitting(true);
    try {
      const mediaUrls: string[] = [];

      if (selectedFile) {
        try {
          const presigned = await apiService.getPresignedUploadUrl(
            selectedFile.name,
            selectedFile.type,
            selectedFile.size
          );
          if (presigned.fileUrl) {
            mediaUrls.push(presigned.fileUrl);
          }
        } catch (uploadErr) {
          console.warn('S3 upload fallback:', uploadErr);
          if (filePreview) mediaUrls.push(filePreview);
        }
      }

      const newInc = await apiService.createIncident(
        {
          title,
          category,
          severity,
          description,
          locationName,
          district,
          state,
          latitude,
          longitude,
          peopleAffected,
          reporterContact,
          mediaUrls,
        },
        currentUser ? currentUser.role : 'CITIZEN',
        currentUser ? currentUser.name : 'Citizen Reporter'
      );

      setIsSubmitting(false);
      setCreatedIncident(newInc);
      if (onSubmitted) onSubmitted();
    } catch (err: any) {
      setIsSubmitting(false);
      alert(`Submission error: ${err.message || 'Failed to submit incident report'}`);
    }
  };

  const handleResetAndClose = () => {
    setCreatedIncident(null);
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
      aria-labelledby="report-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-xl w-full max-h-[92vh] sm:max-h-[88vh] shadow-2xl flex flex-col relative text-slate-800 dark:text-slate-100 overflow-hidden transition-colors">
        {/* Top Amber Accent Line */}
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 shrink-0" />

        {/* Pinned Sticky Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-between bg-slate-50/90 dark:bg-slate-900/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h3 id="report-modal-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Report Disaster Hazard
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Citizen & Responder Hazard Verification</p>
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
          {createdIncident ? (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Incident Recorded</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Incident ID: <strong className="text-amber-600 dark:text-amber-400 font-mono">{createdIncident.incidentId}</strong>
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Title:</span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[260px]">{createdIncident.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Category & Severity:</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-300">
                    {createdIncident.category} ({createdIncident.severity})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Location:</span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[260px]">{createdIncident.locationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Lifecycle Status:</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                    {createdIncident.status} (Awaiting Control-Room Triage)
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-300">
                Incoming reports sync directly into the Active Incidents Feed and can be triaged and dispatched by the Control-Room Operator role.
              </div>
            </div>
          ) : (
            <form id="report-form" onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Incident Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Severe waterlogging at Milan Subway / River backflow"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Disaster Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DisasterCategory)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Waterlogging">Waterlogging / Urban Inundation</option>
                    <option value="Flood">Riverine Flood / Embankment Breach</option>
                    <option value="Cyclone">Cyclone / Gale Winds</option>
                    <option value="Landslide">Landslide / Mudflow</option>
                    <option value="Building Collapse">Building / Wall Collapse</option>
                    <option value="Fire">Fire / Explosion</option>
                    <option value="Industrial Hazard">Industrial Gas / Chemical Leak</option>
                    <option value="Heatwave">Severe Heatwave / Sunstroke</option>
                    <option value="Other Emergency">Other Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Estimated Severity <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Critical">Critical (Immediate Life Danger)</option>
                    <option value="High">High (Major Disruption / Trapped)</option>
                    <option value="Medium">Medium (Property Risk / Slow Inundation)</option>
                    <option value="Low">Low (Advisory / Traffic Diversion)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Description of Hazard & Scene <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail current flood water depth, stranded persons, access hurdles, live electrical wires..."
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Locality / Landmark <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. LBS Marg, Kurla West"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Est. People Affected</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    value={peopleAffected}
                    onChange={(e) => setPeopleAffected(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* GPS & Location Coordinates */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>{latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E</span>
                </div>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Detecting...' : 'Pin Current GPS'}</span>
                </button>
              </div>
              {locationError && <p className="text-[11px] text-amber-600 dark:text-amber-400">{locationError}</p>}

              {/* Photo upload */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <UploadCloud className="w-3.5 h-3.5 text-amber-500" />
                  <span>Evidence Photo (Private Cloud Upload)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-200 dark:file:bg-slate-800 file:text-slate-800 dark:file:text-slate-200 hover:file:bg-slate-300 dark:hover:file:bg-slate-700 cursor-pointer"
                />
                {filePreview && (
                  <div className="mt-2 relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700">
                    <img src={filePreview} alt="Damage Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Pinned Sticky Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/90 dark:bg-slate-900/95 flex items-center justify-between gap-3">
          {createdIncident ? (
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
            <div className="w-full flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="report-form"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-600/30 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Recording Incident...' : 'Submit Incident Report'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
