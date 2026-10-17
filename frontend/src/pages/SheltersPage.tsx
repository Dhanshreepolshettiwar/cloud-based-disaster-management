import React, { useState, useEffect } from 'react';
import { Home, Package, MapPin, Phone } from 'lucide-react';
import { apiService } from '../services/api';
import { Shelter, ResourceItem } from '../types';
import { useAuth } from '../context/AuthContext';

export const SheltersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [activeTab, setActiveTab] = useState<'shelters' | 'resources'>('shelters');
  const [newOccupancyMap, setNewOccupancyMap] = useState<Record<string, number>>({});

  const canManage = currentUser.role === 'AUTHORITY' || currentUser.role === 'ADMIN';

  const loadData = async () => {
    try {
      const [shelterData, resourceData] = await Promise.all([
        apiService.getShelters(),
        apiService.getResources(),
      ]);
      setShelters(shelterData);
      setResources(resourceData);
    } catch (e) {
      console.error('Error loading shelters/resources:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateOccupancy = async (shelterId: string) => {
    const val = newOccupancyMap[shelterId];
    if (val === undefined) return;
    try {
      await apiService.updateShelterOccupancy(shelterId, val);
      alert('Shelter occupancy updated!');
      loadData();
    } catch (e: any) {
      alert(`Update failed: ${e.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Emergency Shelters & Relief Supplies</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified emergency community refuge shelters and disaster logistics inventory
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('shelters')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'shelters'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Evacuation Shelters ({shelters.length})
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'resources'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Relief Supplies Inventory ({resources.length})
          </button>
        </div>
      </div>

      {activeTab === 'shelters' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shelters.map((shelter) => {
            const availableSlots = Math.max(0, shelter.capacity - shelter.currentOccupancy);
            const occupancyPct = Math.min(100, Math.round((shelter.currentOccupancy / shelter.capacity) * 100));

            return (
              <div
                key={shelter.shelterId}
                className="bg-slate-800/70 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-white">{shelter.name}</h2>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{shelter.address}</span>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      shelter.status === 'Open'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    }`}
                  >
                    {shelter.status}
                  </span>
                </div>

                {/* Occupancy Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Current Occupancy</span>
                    <span className="font-bold text-white">
                      {shelter.currentOccupancy} / {shelter.capacity} Beds ({occupancyPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all ${
                        occupancyPct > 90
                          ? 'bg-rose-500'
                          : occupancyPct > 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold">
                    {availableSlots} available slots remaining
                  </div>
                </div>

                {/* Facilities Badges */}
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-1.5">On-Site Facilities:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {shelter.facilities.map((f, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-[11px] text-slate-300"
                      >
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact info */}
                <div className="text-xs text-slate-300 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                  <div>
                    In-Charge: <strong>{shelter.contactPerson}</strong>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-emerald-400">
                    <Phone className="w-3 h-3" />
                    <span>{shelter.contactPhone}</span>
                  </div>
                </div>

                {/* Authority Occupancy Adjuster */}
                {canManage && (
                  <div className="pt-3 border-t border-slate-700/60 space-y-2">
                    <label className="text-xs font-semibold text-slate-400">
                      Update Live Occupancy Count (Authority Action):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={shelter.capacity}
                        defaultValue={shelter.currentOccupancy}
                        onChange={(e) =>
                          setNewOccupancyMap({
                            ...newOccupancyMap,
                            [shelter.shelterId]: Number(e.target.value),
                          })
                        }
                        className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                      <button
                        onClick={() => handleUpdateOccupancy(shelter.shelterId)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                      >
                        Save Count
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-700">
                <tr>
                  <th className="py-3 px-3">Item Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Available Stock</th>
                  <th className="py-3 px-3">Storage Depot Location</th>
                  <th className="py-3 px-3">Availability Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {resources.map((res) => (
                  <tr key={res.resourceId} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-bold text-white text-sm">{res.name}</td>
                    <td className="py-3 px-3">{res.category}</td>
                    <td className="py-3 px-3 font-semibold text-white">
                      {res.quantity.toLocaleString()} {res.unit}
                    </td>
                    <td className="py-3 px-3">{res.storageLocation}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                          res.status === 'Available'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        }`}
                      >
                        {res.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
