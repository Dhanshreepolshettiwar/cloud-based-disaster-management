import React, { useState } from 'react';
import { X, AlertTriangle, MapPin, Users, Phone, CheckCircle, Navigation } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const SOSModal: React.FC<SOSModalProps> = ({ isOpen, onClose, onSubmitted }) => {
  const { currentUser } = useAuth();
  const [emergencyType, setEmergencyType] = useState('Trapped by floodwaters');
  const [locationDescription, setLocationDescription] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(19.082);
  const [longitude, setLongitude] = useState<number | undefined>(72.889);
  const [peopleCount, setPeopleCount] = useState(2);
  const [phone, setPhone] = useState(currentUser.phoneNumber || '');
  const [notes, setNotes] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
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
        alert('Could not automatically determine GPS location. Please write your address below.');
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationDescription.trim()) {
      alert('Please describe your location so rescue teams can reach you.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.submitSOS(
        {
          emergencyType,
          locationDescription,
          latitude,
          longitude,
          peopleCount,
          requesterPhone: phone,
          notes,
          urgency: 'Critical',
        },
        currentUser.name
      );

      setIsSubmitting(false);
      setSubmittedSuccess(true);
      if (onSubmitted) onSubmitted();
    } catch (err: any) {
      setIsSubmitting(false);
      alert(`Submission error: ${err.message || 'Failed to submit SOS'}`);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-red-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Header Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Emergency SOS Distress Beacon</h3>
              <p className="text-xs text-red-400">High-priority first responder dispatch</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer Notice */}
        <div className="bg-red-950/60 border border-red-800/60 rounded-xl p-3 mb-5 text-xs text-red-300 leading-relaxed">
          <strong>CRITICAL NOTICE:</strong> This application transmits distress signals directly to rescue coordinators. If telephone network is operational, call <strong>112 / 911</strong> simultaneously.
        </div>

        {submittedSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-white">SOS Beacon Broadcasted!</h4>
            <p className="text-sm text-slate-300 max-w-sm mx-auto">
              Your distress signal and GPS coordinates have been registered in the system. Rescue team commanders have been notified. Stay in a safe, elevated location if possible.
            </p>
            <button
              onClick={handleResetAndClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Emergency Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nature of Emergency</label>
              <select
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              >
                <option value="Trapped by floodwaters">Trapped by floodwaters</option>
                <option value="Building structural collapse">Building structural collapse / Entrapment</option>
                <option value="Active Fire / Smoke hazard">Active Fire / Smoke inhalation</option>
                <option value="Severe Medical Trauma">Severe Medical Trauma</option>
                <option value="Cyclone wind / Debris hazard">Cyclone wind / Falling debris</option>
                <option value="Hazardous chemical exposure">Hazardous chemical exposure</option>
                <option value="Other life-threatening danger">Other life-threatening danger</option>
              </select>
            </div>

            {/* Location Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  Exact Location / Address *
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-medium transition"
                >
                  <Navigation className="w-3 h-3" />
                  {isLocating ? 'Detecting GPS...' : 'Use My GPS'}
                </button>
              </div>
              <textarea
                required
                rows={2}
                value={locationDescription}
                onChange={(e) => setLocationDescription(e.target.value)}
                placeholder="E.g., Flat 302, Green Valley Apartments, 3rd Floor, near Metro Pillar 124"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 resize-none"
              />
              {latitude && longitude && (
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </div>
              )}
            </div>

            {/* People & Contact Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  People Needing Rescue
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Medical Needs / Urgency Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., Elderly patient needing insulin, water level rising fast"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Submit SOS Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-red-600/40 transition active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  TRANSMITTING DISTRESS SIGNAL...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  CONFIRM & TRANSMIT SOS BEACON
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
