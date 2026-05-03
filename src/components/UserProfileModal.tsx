/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MapPin, 
  Leaf, 
  Sprout, 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Compass,
  Save,
  CheckCircle2
} from 'lucide-react';
import { UserProfile } from '../services/geminiService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

export default function UserProfileModal({ isOpen, onClose, profile, onSave }: UserProfileModalProps) {
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditedProfile(profile);
      setIsSaved(false);
    }
  }, [isOpen, profile]);

  const handleSave = () => {
    onSave(editedProfile);
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-black/5 flex items-center justify-between bg-[#FDFCFB]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">Environmental Context</span>
              </div>
              <h2 className="text-2xl font-serif italic text-black/80">Farm Profile</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-black/5 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-black/40" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Info */}
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-black/40 mb-2">
                    <MapPin className="w-3.5 h-3.5" /> Geographic Location
                  </label>
                  <input
                    type="text"
                    value={editedProfile.location}
                    onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                    placeholder="e.g., Central Valley, California"
                    className="w-full p-3 bg-black/5 border border-black/5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-black/40 mb-2">
                    <Leaf className="w-3.5 h-3.5" /> Primary Crops
                  </label>
                  <textarea
                    value={editedProfile.typicalCrops}
                    onChange={(e) => setEditedProfile({ ...editedProfile, typicalCrops: e.target.value })}
                    placeholder="e.g., Almonds, Grapes, Walnuts"
                    rows={2}
                    className="w-full p-3 bg-black/5 border border-black/5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-black/40 mb-2">
                    <Sprout className="w-3.5 h-3.5" /> Farming Practices
                  </label>
                  <textarea
                    value={editedProfile.farmingPractices}
                    onChange={(e) => setEditedProfile({ ...editedProfile, farmingPractices: e.target.value })}
                    placeholder="e.g., Organic, Minimum Tillage, Drip Irrigation"
                    rows={2}
                    className="w-full p-3 bg-black/5 border border-black/5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none"
                  />
                </div>
              </div>

              {/* Detailed Environment */}
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-black/40 mb-2">
                    <CloudRain className="w-3.5 h-3.5" /> Climate Patterns
                  </label>
                  <input
                    type="text"
                    value={editedProfile.weatherPatterns || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, weatherPatterns: e.target.value })}
                    placeholder="e.g., Mediterranean, Dry Summers"
                    className="w-full p-3 bg-black/5 border border-black/5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-black/40 mb-2">
                    <Thermometer className="w-3.5 h-3.5" /> Soil Characteristics
                  </label>
                  <input
                    type="text"
                    value={editedProfile.soilType || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, soilType: e.target.value })}
                    placeholder="e.g., Sandy Loam, Well-drained"
                    className="w-full p-3 bg-black/5 border border-black/5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-black/40 mb-2">
                    <Droplets className="w-3.5 h-3.5" /> Water Sources
                  </label>
                  <input
                    type="text"
                    value={editedProfile.waterSources || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, waterSources: e.target.value })}
                    placeholder="e.g., Groundwater, Surface Canal"
                    className="w-full p-3 bg-black/5 border border-black/5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-black/40 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Nearby Flora
                  </label>
                  <input
                    type="text"
                    value={editedProfile.nearbyFlora || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, nearbyFlora: e.target.value })}
                    placeholder="e.g., Oak Savanna, Wild Grasslands"
                    className="w-full p-3 bg-black/5 border border-black/5 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-sm">
              <p className="text-[10px] text-emerald-800/60 leading-relaxed italic font-serif">
                This information provides the ground-truth for AgroBot's diagnostic AI. Providing specific soil types and climate patterns enables high-precision advisory.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-black/5 bg-[#FDFCFB] flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaved}
              className={`flex items-center gap-2 px-8 py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${
                isSaved 
                  ? 'bg-emerald-600 text-white cursor-default' 
                  : 'bg-black text-white hover:bg-black/90 active:scale-95'
              }`}
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Profile Updated
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
