import React, { useState, useEffect } from 'react';
import {
  Home,
  Package,
  MapPin,
  Phone,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Minus,
  Truck,
  HeartPulse,
  Accessibility,
  Clock,
} from 'lucide-react';
import { apiService } from '../services/api';
import { Shelter, ResourceItem } from '../types';
import { useAuth } from '../context/AuthContext';

export const SheltersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [activeTab, setActiveTab] = useState<'shelters' | 'resources'>('shelters');

  // Shelters filters
  const [shelterSearch, setShelterSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [facilityFilter, setFacilityFilter] = useState('All');
  const [newOccupancyMap, setNewOccupancyMap] = useState<Record<string, number>>({});

  // Inventory dispatch modal
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);
  const [dispatchQty, setDispatchQty] = useState<number>(1);
  const [dispatchType, setDispatchType] = useState<'dispatch' | 'restock'>('dispatch');
  const [dispatchMsg, setDispatchMsg] = useState('');

  const canManage = currentUser ? (currentUser.role === 'AUTHORITY' || currentUser.role === 'ADMIN') : false;

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
      alert('Shelter occupancy updated successfully!');
      loadData();
    } catch (e: any) {
      alert(`Update failed: ${e.message}`);
    }
  };

  const handleStockAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource) return;
    try {
      await apiService.adjustResourceStock(
        selectedResource.resourceId,
        dispatchQty,
        dispatchType
      );
      setDispatchMsg(
        `Successfully ${dispatchType === 'dispatch' ? 'dispatched' : 'restocked'} ${dispatchQty} ${selectedResource.unit}!`
      );
      loadData();
      setTimeout(() => {
        setDispatchMsg('');
        setSelectedResource(null);
        setDispatchQty(1);
      }, 2000);
    } catch (e: any) {
      alert(`Inventory operation failed: ${e.message}`);
    }
  };

  const filteredShelters = shelters.filter((s) => {
    if (statusFilter !== 'All' && s.status !== statusFilter) return false;
    if (facilityFilter === 'Medical' && !s.hasMedicalSupport) return false;
    if (facilityFilter === 'Wheelchair' && !s.isWheelchairAccessible) return false;
    if (shelterSearch.trim()) {
      const q = shelterSearch.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.locality.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Emergency Shelters & Relief Supplies</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified Municipal Refuge Centers and Disaster Logistics Inventory
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('shelters')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'shelters'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Evacuation Shelters ({shelters.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'resources'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Relief Inventory ({resources.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'shelters' ? (
        <div className="space-y-4">
          {/* Shelters Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={shelterSearch}
                onChange={(e) => setShelterSearch(e.target.value)}
                placeholder="Search by shelter name or locality..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
            >
              <option value="All">All Availability (Open / Full)</option>
              <option value="Open">Open (Has Available Beds)</option>
              <option value="Full">Full (At Maximum Capacity)</option>
            </select>

            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
            >
              <option value="All">All Facilities</option>
              <option value="Medical">Has Medical Doctor / First Aid</option>
              <option value="Wheelchair">Wheelchair Accessible Ramp</option>
            </select>
          </div>

          {/* Shelters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredShelters.map((shelter) => {
              const availableSlots = Math.max(0, shelter.capacity - shelter.currentOccupancy);
              const occupancyPct = Math.min(
                100,
                Math.round((shelter.currentOccupancy / shelter.capacity) * 100)
              );

              return (
                <div
                  key={shelter.shelterId}
                  className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-xl space-y-4 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400">{shelter.shelterId}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            shelter.status === 'Open'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {shelter.status}
                        </span>
                      </div>
                      <h2 className="text-sm sm:text-base font-bold text-white mt-1">{shelter.name}</h2>
                      <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{shelter.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Capacity & Occupancy Bar */}
                  <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-700/80">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-400">Bed Occupancy:</span>
                      <span className="text-white">
                        {shelter.currentOccupancy} / {shelter.capacity} ({occupancyPct}%)
                      </span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          occupancyPct >= 95
                            ? 'bg-red-500'
                            : occupancyPct >= 75
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] pt-1">
                      <span className="text-emerald-400 font-bold">
                        {availableSlots} Available Bed Slots
                      </span>
                      <span className="text-slate-400 font-mono">
                        {shelter.latitude.toFixed(4)}° N, {shelter.longitude.toFixed(4)}° E
                      </span>
                    </div>
                  </div>

                  {/* Verified Facilities */}
                  <div>
                    <span className="font-bold text-slate-300 block mb-1.5">Verified Facilities:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {shelter.facilities.map((f, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-750 border border-slate-700 text-slate-300 text-[10px]"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400">
                    <div>
                      Coordinator: <strong className="text-slate-200">{shelter.contactPerson}</strong>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-emerald-400">
                      <Phone className="w-3 h-3" />
                      <span>{shelter.contactPhone}</span>
                    </div>
                  </div>

                  {/* Occupancy Update (Authority/Admin only) */}
                  {canManage && (
                    <div className="pt-2 border-t border-slate-700/80 flex items-center gap-2">
                      <span className="text-slate-400 font-semibold">Live Occupancy:</span>
                      <input
                        type="number"
                        min="0"
                        max={shelter.capacity}
                        placeholder={shelter.currentOccupancy.toString()}
                        onChange={(e) =>
                          setNewOccupancyMap({
                            ...newOccupancyMap,
                            [shelter.shelterId]: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold"
                      />
                      <button
                        onClick={() => handleUpdateOccupancy(shelter.shelterId)}
                        className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold text-[11px]"
                      >
                        Update
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Relief Supplies Tab */
        <div className="space-y-4">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white">Emergency Logistics & Warehouse Inventory</h2>
                <p className="text-xs text-slate-400">Tracking regional depot allocations, thresholds, and dispatch records</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="p-3 sm:p-4">Item Name</th>
                    <th className="p-3 sm:p-4">Category</th>
                    <th className="p-3 sm:p-4">Available Stock</th>
                    <th className="p-3 sm:p-4">Depot Location</th>
                    <th className="p-3 sm:p-4">Status</th>
                    {canManage && <th className="p-3 sm:p-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 font-medium">
                  {resources.map((item) => (
                    <tr key={item.resourceId} className="hover:bg-slate-750/50 transition">
                      <td className="p-3 sm:p-4">
                        <div className="font-bold text-white">{item.name}</div>
                        <div className="text-[10px] text-slate-400">ID: {item.resourceId}</div>
                      </td>
                      <td className="p-3 sm:p-4 text-slate-300">{item.category}</td>
                      <td className="p-3 sm:p-4 font-mono font-bold text-white">
                        {item.quantity.toLocaleString()} {item.unit}
                      </td>
                      <td className="p-3 sm:p-4 text-slate-300">{item.storageLocation}</td>
                      <td className="p-3 sm:p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'Available'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : item.status === 'Low Stock'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-red-500/20 text-red-300 border border-red-500/40'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      {canManage && (
                        <td className="p-3 sm:p-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedResource(item);
                              setDispatchType('dispatch');
                              setDispatchQty(1);
                            }}
                            className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition mr-1.5"
                          >
                            Dispatch
                          </button>
                          <button
                            onClick={() => {
                              setSelectedResource(item);
                              setDispatchType('restock');
                              setDispatchQty(10);
                            }}
                            className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-[11px] transition"
                          >
                            Restock
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stock Dispatch / Restock Dialog */}
          {selectedResource && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-slate-200 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-white text-sm">
                    {dispatchType === 'dispatch' ? 'Dispatch Supplies' : 'Restock Supplies'}
                  </h3>
                  <button
                    onClick={() => setSelectedResource(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {dispatchMsg ? (
                  <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold text-center">
                    {dispatchMsg}
                  </div>
                ) : (
                  <form onSubmit={handleStockAction} className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400">Item:</span>
                      <div className="font-bold text-white text-sm mt-0.5">{selectedResource.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Current stock: {selectedResource.quantity} {selectedResource.unit}
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Quantity to {dispatchType === 'dispatch' ? 'Dispatch' : 'Restock'} ({selectedResource.unit}):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={dispatchType === 'dispatch' ? selectedResource.quantity : 100000}
                        value={dispatchQty}
                        onChange={(e) => setDispatchQty(parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setSelectedResource(null)}
                        className="px-3 py-1.5 rounded bg-slate-800 text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                      >
                        Confirm {dispatchType === 'dispatch' ? 'Dispatch' : 'Restock'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
