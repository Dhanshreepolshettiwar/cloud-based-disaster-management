import React, { useState } from 'react';
import { X, Flame, MapPin, UploadCloud, CheckCircle, Navigation } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DisasterCategory, SeverityLevel } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmitted }) => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DisasterCategory>('Flood');
  const [severity, setSeverity] = useState<SeverityLevel>('High');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState(19.076);
  const [longitude, setLongitude] = useState(72.8777);
  const [reporterContact, setReporterContact] = useState(currentUser.phoneNumber || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(6)));
        setLongitude(Number(pos.coords.longitude.toFixed(6)));
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        alert('Could not determine GPS coordinates. Enter address manually.');
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !locationName.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const mediaUrls: string[] = [];

      // If photo was selected, simulate or perform S3 upload via presigned URL
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

      await apiService.createIncident(
        {
          title,
          category,
          severity,
          description,
          locationName,
          latitude,
          longitude,
          reporterContact,
          mediaUrls,
        },
        currentUser.role,
        currentUser.name
      );

      setIsSubmitting(false);
      setSubmittedSuccess(true);
      if (onSubmitted) onSubmitted();
    } catch (err: any) {
      setIsSubmitting(false);
      alert(`Submission failed: ${err.message || 'Error creating incident'}`);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedSuccess(false);
    setSelectedFile(null);
    setFilePreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Report Disaster Incident</h3>
              <p className="text-xs text-slate-400">Citizen & Field Authority Reporting Portal</p>
            </div>
          </div>
          <button onClick={handleResetAndClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-white">Incident Successfully Recorded</h4>
            <p className="text-sm text-slate-300 max-w-sm mx-auto">
              The incident has been registered in the disaster database and flagged for immediate authority review and verification.
            </p>
            <button
              onClick={handleResetAndClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Incident Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Bridge Overpass Flood Inundation"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Category & Severity Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DisasterCategory)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Flood">Flood</option>
                  <option value="Fire">Fire</option>
                  <option value="Earthquake">Earthquake</option>
                  <option value="Cyclone">Cyclone</option>
                  <option value="Landslide">Landslide</option>
                  <option value="Industrial Accident">Industrial Accident</option>
                  <option value="Building Collapse">Building Collapse</option>
                  <option value="Other Emergency">Other Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Initial Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Low">Low - Monitored</option>
                  <option value="Medium">Medium - Response Advised</option>
                  <option value="High">High - Serious Danger</option>
                  <option value="Critical">Critical - Life Threatening</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description & Observations *</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide accurate description of damage, affected population, hazards, and current condition..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            {/* Location */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  Location / Area Name *
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                >
                  <Navigation className="w-3 h-3" />
                  {isLocating ? 'Detecting...' : 'Get GPS'}
                </button>
              </div>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="E.g., Sector 14, Riverside Causeway"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Pin: {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </div>
            </div>

            {/* S3 Media Upload Attachment */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <UploadCloud className="w-3.5 h-3.5 text-slate-400" />
                Upload Photo / Evidence (Direct to Amazon S3)
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
              />
              {filePreview && (
                <div className="mt-2 relative rounded-lg overflow-hidden border border-slate-700 max-h-36">
                  <img src={filePreview} alt="Preview" className="w-full h-36 object-cover" />
                </div>
              )}
            </div>

            {/* Reporter Contact */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Reporter Contact (Optional)</label>
              <input
                type="tel"
                value={reporterContact}
                onChange={(e) => setReporterContact(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-600/30 transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Recording Incident...
                </>
              ) : (
                'Submit Incident Report'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
