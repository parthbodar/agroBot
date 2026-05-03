/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Beaker, ChevronRight, AlertCircle } from 'lucide-react';

interface SoilAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: string) => void;
}

export default function SoilAnalysisModal({ isOpen, onClose, onSubmit }: SoilAnalysisModalProps) {
  const [formData, setFormData] = useState({
    pH: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    organicMatter: '',
    soilType: 'Loamy',
    location: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const summary = `
SOIL ANALYSIS REQUEST:
- pH Level: ${formData.pH}
- Nitrogen (N): ${formData.nitrogen} mg/kg
- Phosphorus (P): ${formData.phosphorus} mg/kg
- Potassium (K): ${formData.potassium} mg/kg
- Organic Matter: ${formData.organicMatter}%
- Soil Type: ${formData.soilType}
- Location/Climate: ${formData.location}

Please provide a detailed recommendation for fertilization, soil amendments, and suitable crops based on these results.
    `.trim();
    onSubmit(summary);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#FAF9F6] rounded-sm shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] overflow-y-auto md:overflow-hidden"
          >
            {/* Sidebar Branding */}
            <div className="w-full md:w-48 bg-[#2D4635] p-8 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 flex-shrink-0">
              <div>
                <Beaker className="w-8 h-8 text-emerald-400 mb-6" />
                <h2 className="font-serif text-3xl italic tracking-tight leading-none mb-2">Soil Lab</h2>
                <p className="text-[10px] uppercase tracking-widest text-white/40">Diagnostic Unit</p>
              </div>
              <div className="hidden md:block">
                <p className="text-[9px] leading-relaxed text-white/30 italic">
                  Input precision metrics for evidence-based agricultural advice.
                </p>
              </div>
            </div>

            {/* Form Area */}
            <form onSubmit={handleSubmit} className="flex-1 p-8 md:p-12 space-y-8 bg-white uppercase">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-bold tracking-[0.2em] text-black/40">Precision Metrics</h3>
                <button type="button" onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                  <X className="w-4 h-4 text-black/40" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* pH Level */}
                <div className="space-y-2 border-b border-black/5 pb-2">
                  <label className="block text-[10px] font-bold tracking-widest">pH Level (0-14)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.pH}
                    onChange={(e) => setFormData({ ...formData, pH: e.target.value })}
                    className="w-full bg-transparent font-serif italic text-xl focus:outline-none placeholder:text-black/10"
                    placeholder="e.g. 6.5"
                  />
                </div>

                {/* Organic Matter */}
                <div className="space-y-2 border-b border-black/5 pb-2">
                  <label className="block text-[10px] font-bold tracking-widest">Organic Matter (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.organicMatter}
                    onChange={(e) => setFormData({ ...formData, organicMatter: e.target.value })}
                    className="w-full bg-transparent font-serif italic text-xl focus:outline-none placeholder:text-black/10"
                    placeholder="e.g. 4.2"
                  />
                </div>

                {/* NPK Inputs */}
                <div className="space-y-2 border-b border-black/5 pb-2">
                  <label className="block text-[10px] font-bold tracking-widest">Nitrogen (N) mg/kg</label>
                  <input
                    type="number"
                    required
                    value={formData.nitrogen}
                    onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value })}
                    className="w-full bg-transparent font-serif italic text-xl focus:outline-none placeholder:text-black/10"
                    placeholder="25"
                  />
                </div>

                <div className="space-y-2 border-b border-black/5 pb-2">
                  <label className="block text-[10px] font-bold tracking-widest">Phosphorus (P) mg/kg</label>
                  <input
                    type="number"
                    required
                    value={formData.phosphorus}
                    onChange={(e) => setFormData({ ...formData, phosphorus: e.target.value })}
                    className="w-full bg-transparent font-serif italic text-xl focus:outline-none placeholder:text-black/10"
                    placeholder="15"
                  />
                </div>

                <div className="space-y-2 border-b border-black/5 pb-2">
                  <label className="block text-[10px] font-bold tracking-widest">Potassium (K) mg/kg</label>
                  <input
                    type="number"
                    required
                    value={formData.potassium}
                    onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                    className="w-full bg-transparent font-serif italic text-xl focus:outline-none placeholder:text-black/10"
                    placeholder="180"
                  />
                </div>

                {/* Soil Type */}
                <div className="space-y-4 border-b border-black/5 pb-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold tracking-widest">Soil Texture</label>
                    <select
                      value={formData.soilType}
                      onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                      className="w-full bg-transparent font-serif italic text-lg appearance-none focus:outline-none cursor-pointer"
                    >
                      <option>Sandy</option>
                      <option>Clay</option>
                      <option>Loamy</option>
                      <option>Silt</option>
                      <option>Peaty</option>
                    </select>
                  </div>

                  {/* Visualization Graphic */}
                  <div className="h-16 w-full rounded-sm overflow-hidden relative border border-black/5 flex items-center justify-center group">
                    <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                      {formData.soilType === 'Sandy' && (
                        <div className="w-full h-full bg-[#f3e5ab] relative">
                          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#c2b280 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
                        </div>
                      )}
                      {formData.soilType === 'Clay' && (
                        <div className="w-full h-full bg-[#a35d44] flex flex-wrap">
                          <div className="w-full h-full border-2 border-[#834d34] opacity-30" />
                        </div>
                      )}
                      {formData.soilType === 'Loamy' && (
                        <div className="w-full h-full bg-[#4a3728] relative">
                           <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#322419 2px, transparent 2px)', backgroundSize: '8px 8px' }} />
                        </div>
                      )}
                      {formData.soilType === 'Silt' && (
                        <div className="w-full h-full bg-[#b2ada3] opacity-80" />
                      )}
                      {formData.soilType === 'Peaty' && (
                        <div className="w-full h-full bg-[#2a1d15] relative">
                           <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(45deg, #1a0f0a 25%, transparent 25%, transparent 50%, #1a0f0a 50%, #1a0f0a 75%, transparent 75%, transparent)' , backgroundSize: '10px 10px'}} />
                        </div>
                      )}
                    </div>
                    <div className="relative z-10 flex items-center gap-2">
                       <div className={`w-3 h-3 rounded-full ${
                         formData.soilType === 'Sandy' ? 'bg-[#c2b280]' :
                         formData.soilType === 'Clay' ? 'bg-[#a35d44]' :
                         formData.soilType === 'Loamy' ? 'bg-[#4a3728]' :
                         formData.soilType === 'Silt' ? 'bg-[#b2ada3]' : 'bg-[#2a1d15]'
                       }`} />
                       <span className="text-[10px] font-bold tracking-[0.2em] opacity-40">{formData.soilType} Archetype</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2 border-b border-black/5 pb-2">
                <label className="block text-[10px] font-bold tracking-widest">Region / Climate Zone</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-transparent font-serif italic text-lg focus:outline-none placeholder:text-black/10"
                  placeholder="e.g. Temperate / Northern Region"
                />
              </div>

              {/* Notice */}
              <div className="flex gap-4 p-4 bg-[#2D4635]/5 border border-[#2D4635]/10 rounded-sm">
                <AlertCircle className="w-4 h-4 text-[#2D4635] flex-shrink-0" />
                <p className="text-[9px] lowercase opacity-50 font-medium tracking-tight">
                  results are processed via gemini intelligence and should be verified against local agricultural extension standards.
                </p>
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3 bg-[#2D4635] text-white rounded-sm hover:translate-x-1 transition-all shadow-lg active:scale-95 group"
                >
                  <span className="text-[10px] font-bold tracking-widest uppercase">Run Diagnostic</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
