/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Leaf, Wheat, Sprout, ChevronRight, Info, Search, Heart, Users, Bug, Check, TrendingUp, AlertCircle, Clock } from 'lucide-react';

export interface LifecycleStage {
  stage: string;
  startMonth: number; // 0-11
  endMonth: number;
  soilMoisture?: string;
  drainage?: string;
}

interface CropVariety {
  id: string;
  name: string;
  description: string;
  tags?: string[];
  stages?: LifecycleStage[];
}

interface CompanionPlant {
  name: string;
  category: 'Nitrogen Fixation' | 'Pest Deterrence' | 'Growth Enhancement' | 'Moisture Retention' | 'Structural Support' | 'Trap Crop';
  benefit: string;
}

interface Crop {
  id: string;
  name: string;
  scientificName: string;
  tags: string[];
  stages: LifecycleStage[];
  description: string;
  idealPH: string;
  companionPlants: CompanionPlant[];
  varieties?: CropVariety[];
}

export const CROPS: Crop[] = [
  {
    id: '1',
    name: 'Wheat',
    scientificName: 'Triticum aestivum',
    tags: ['grain', 'cereal', 'staple'],
    stages: [
      { 
        stage: 'Planting', 
        startMonth: 8, 
        endMonth: 9, 
        soilMoisture: 'Keep consistently moist, at least 50% field capacity.', 
        drainage: 'Well-drained soil essential to prevent seed rot.' 
      },
      { 
        stage: 'Growth', 
        startMonth: 10, 
        endMonth: 4, 
        soilMoisture: 'Moderate; avoid water stress during tillering.', 
        drainage: 'Good superficial drainage to prevent waterlogging during rains.' 
      },
      { 
        stage: 'Harvest', 
        startMonth: 5, 
        endMonth: 6, 
        soilMoisture: 'Low; reduce irrigation to allow grain to dry.', 
        drainage: 'Dry conditions preferred for efficient machinery operation.' 
      },
    ],
    description: 'A staple cereal grain, critical for global food security.',
    idealPH: '6.0 - 7.0',
    companionPlants: [
      { name: 'Legumes', category: 'Nitrogen Fixation', benefit: 'Fixes atmospheric nitrogen into the soil, reducing fertilizer needs.' },
      { name: 'Buckwheat', category: 'Trap Crop', benefit: 'Acts as a trap crop for pests and suppresses competitive weeds.' }
    ],
    varieties: [
      { 
        id: '1-1', 
        name: 'Hard Red Winter', 
        description: 'High protein, used for bread and all-purpose flour. Planted in fall.',
        tags: ['winter', 'bread-wheat'],
        stages: [
          { 
            stage: 'Planting', 
            startMonth: 8, 
            endMonth: 10, 
            soilMoisture: 'Consistently moist; moisture is critical for establishment before first frost.', 
            drainage: 'Excellent drainage to avoid freezing of stagnant water around seeds.' 
          },
          { 
            stage: 'Dormancy', 
            startMonth: 11, 
            endMonth: 1, 
            soilMoisture: 'Minimal; preserve moisture without saturation.', 
            drainage: 'High drainage keeps roots from rotting during snowmelt.' 
          },
          { 
            stage: 'Growth', 
            startMonth: 2, 
            endMonth: 4, 
            soilMoisture: 'Moderate; keep damp during rapid architectural expansion.', 
            drainage: 'Standard agricultural drainage.' 
          },
          { 
            stage: 'Harvest', 
            startMonth: 5, 
            endMonth: 6, 
            soilMoisture: 'Dry; zero irrigation as grain hardens.', 
            drainage: 'Soil must be dry and load-bearing.' 
          },
        ]
      },
      { 
        id: '1-2', 
        name: 'Durum', 
        description: 'Hardest of all wheats, used for pasta and couscous.',
        tags: ['pasta-wheat'],
        stages: [
          { 
            stage: 'Planting', 
            startMonth: 3, 
            endMonth: 4, 
            soilMoisture: 'Sufficient moisture for early spring vigor.', 
            drainage: 'Quick draining spring soil required.' 
          },
          { 
            stage: 'Growth', 
            startMonth: 5, 
            endMonth: 7, 
            soilMoisture: 'Drought tolerant, but moderate moisture improves kernel quality.', 
            drainage: 'Well-draining loamy soils are ideal.' 
          },
          { 
            stage: 'Harvest', 
            startMonth: 8, 
            endMonth: 9, 
            soilMoisture: 'Very low; harvest in arid conditions for best protein content.', 
            drainage: 'Standard.' 
          },
        ]
      },
      { 
        id: '1-3', 
        name: 'Soft Red Winter', 
        description: 'Used for cakes, pastries, and cookies. Lower protein content with soft texture.',
        tags: ['pastry-wheat'],
        stages: [
          { 
            stage: 'Planting', 
            startMonth: 9, 
            endMonth: 10, 
            soilMoisture: 'Standard planting moisture.', 
            drainage: 'Well-drained silt loam preferred.' 
          },
          { 
            stage: 'Dormancy', 
            startMonth: 11, 
            endMonth: 1, 
            soilMoisture: 'Low; dormant period.', 
            drainage: 'Surface drainage essential to prevent icing.' 
          },
          { 
            stage: 'Growth', 
            startMonth: 2, 
            endMonth: 5, 
            soilMoisture: 'Continuous moderate moisture through booting stage.', 
            drainage: 'Standard.' 
          },
          { 
            stage: 'Harvest', 
            startMonth: 6, 
            endMonth: 7, 
            soilMoisture: 'Decreasing moisture; dry field conditions.', 
            drainage: 'Firm ground for combine harvesters.' 
          },
        ]
      },
      { 
        id: '1-4', 
        name: 'Spelt', 
        description: 'An ancient grain with a nutty flavor, good for bread. Requires specialized hulling.',
        tags: ['ancient-grain'],
        stages: [
          { 
            stage: 'Planting', 
            startMonth: 8, 
            endMonth: 9, 
            soilMoisture: 'High; spelt hulls protect seed but need moisture to soften.', 
            drainage: 'Moderate; more tolerant of wet soils than modern wheat.' 
          },
          { 
            stage: 'Growth', 
            startMonth: 10, 
            endMonth: 5, 
            soilMoisture: 'Steady moderate moisture.', 
            drainage: 'Average; adaptable to less-than-ideal drainage.' 
          },
          { 
            stage: 'Harvest', 
            startMonth: 6, 
            endMonth: 8, 
            soilMoisture: 'Dry; late summer harvest.', 
            drainage: 'Standard.' 
          },
        ]
      },
    ]
  },
  {
    id: '2',
    name: 'Maize (Corn)',
    scientificName: 'Zea mays',
    tags: ['grain', 'vegetable', 'cereal'],
    stages: [
      { 
        stage: 'Planting', 
        startMonth: 3, 
        endMonth: 4, 
        soilMoisture: 'High moisture needed for uniform germination.', 
        drainage: 'Adequate; avoid ponding which can cause damping off.' 
      },
      { 
        stage: 'Growth', 
        startMonth: 5, 
        endMonth: 8, 
        soilMoisture: 'Critical demand during silking/tasseling; soil must remain damp.', 
        drainage: 'Excellent drainage required; corn is sensitive to wet feet.' 
      },
      { 
        stage: 'Harvest', 
        startMonth: 9, 
        endMonth: 10, 
        soilMoisture: 'Low; allow stalks to dry and kernels to reach 15-20% moisture.', 
        drainage: 'Standard; ensure ground is firm enough for harvest.' 
      },
    ],
    description: 'High-energy cereal crop with diverse industrial applications.',
    idealPH: '5.8 - 6.8',
    companionPlants: [
      { name: 'Beans', category: 'Nitrogen Fixation', benefit: 'Provides nitrogen fixation while corn provides structural support.' },
      { name: 'Squash', category: 'Moisture Retention', benefit: 'Large leaves shade the soil, retaining moisture and suppressing weeds.' }
    ],
    varieties: [
      { id: '2-1', name: 'Sweet Corn', description: 'Harvested early for human consumption.', tags: ['vegetable'] },
      { id: '2-2', name: 'Dent Corn', description: 'Primary field corn for animal feed and industry.', tags: ['industrial'] },
    ]
  },
  {
    id: '3',
    name: 'Rice',
    scientificName: 'Oryza sativa',
    tags: ['grain', 'cereal', 'aquatic'],
    stages: [
      { 
        stage: 'Sowing', 
        startMonth: 4, 
        endMonth: 5, 
        soilMoisture: 'Saturated; nursery bed should keep 2-3cm of water.', 
        drainage: 'Controlled; easy flooding and drainage for weed control.' 
      },
      { 
        stage: 'Growth', 
        startMonth: 6, 
        endMonth: 9, 
        soilMoisture: 'Paddy conditions; keep 5-10cm of standing water.', 
        drainage: 'Poor; intentional inundation is the standard environment.' 
      },
      { 
        stage: 'Harvest', 
        startMonth: 10, 
        endMonth: 11, 
        soilMoisture: 'Drying out; drain puddles 2 weeks prior to harvest.', 
        drainage: 'Rapid; soil needs to firm up for manual or mechanical reaping.' 
      },
    ],
    description: 'Primary sustenance for over half the world\'s population.',
    idealPH: '5.5 - 6.5',
    companionPlants: [
      { name: 'Azolla', category: 'Nitrogen Fixation', benefit: 'A water fern that fixes nitrogen through symbiotic cyanobacteria.' },
      { name: 'Duckweed', category: 'Moisture Retention', benefit: 'Reduces water evaporation and suppresses algae growth in paddies.' }
    ],
    varieties: [
      { id: '3-1', name: 'Basmati', description: 'Long-grain aromatic rice from the Indian subcontinent.', tags: ['aromatic'] },
      { id: '3-2', name: 'Jasmine', description: 'Fragrant long-grain rice from Thailand.', tags: ['aromatic'] },
    ]
  },
  {
    id: '4',
    name: 'Soybean',
    scientificName: 'Glycine max',
    tags: ['legume', 'oilseed', 'protein'],
    stages: [
      { 
        stage: 'Planting', 
        startMonth: 4, 
        endMonth: 5, 
        soilMoisture: 'Moist but crumbly; avoid planting in saturated mud.', 
        drainage: 'Moderate; needs air space for nitrogen-fixing bacteria.' 
      },
      { 
        stage: 'Growth', 
        startMonth: 6, 
        endMonth: 8, 
        soilMoisture: 'Peak demand during flowering and pod development.', 
        drainage: 'Well-draining; heavy clay soils can cause root rot.' 
      },
      { 
        stage: 'Harvest', 
        startMonth: 9, 
        endMonth: 9, 
        soilMoisture: 'Deficit irrigation helps synchronize maturity.', 
        drainage: 'Firm soil prevents compaction during harvest.' 
      },
    ],
    description: 'Versatile legume, essential for protein and oil production.',
    idealPH: '6.0 - 6.5',
    companionPlants: [
      { name: 'Corn', category: 'Structural Support', benefit: 'Provides wind protection and structural hierarchy in the field.' },
      { name: 'Potatoes', category: 'Growth Enhancement', benefit: 'Growth cycles are complementary, ensuring efficient nutrient use.' }
    ],
  },
];

const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

export interface TrackedStage {
  stage: string;
  date: string;
}

export interface TrackedCrop {
  id: string;
  plantingDate?: string;
  loggedStages: TrackedStage[];
}

interface CropCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQueryCrop: (cropName: string) => void;
  favorites: TrackedCrop[];
  onToggleFavorite: (id: string) => void;
  onUpdateTrack: (id: string, update: Partial<TrackedCrop>) => void;
}

export default function CropCalendarModal({ isOpen, onClose, onQueryCrop, favorites, onToggleFavorite, onUpdateTrack }: CropCalendarModalProps) {
  const [selectedCropId, setSelectedCropId] = useState<string | null>(CROPS[0].id);
  const [selectedVarietyId, setSelectedVarietyId] = useState<string | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const selectedCrop = useMemo(() => 
    CROPS.find(c => c.id === selectedCropId) || CROPS[0]
  , [selectedCropId]);

  const selectedVariety = useMemo(() => 
    selectedCrop.varieties?.find(v => v.id === selectedVarietyId) || null
  , [selectedCrop, selectedVarietyId]);

  const activeTrack = useMemo(() => 
    favorites.find(f => f.id === (selectedVariety?.id || selectedCrop.id))
  , [favorites, selectedVariety, selectedCrop]);

  const predictions = useMemo(() => {
    if (!activeTrack?.plantingDate) return null;
    const stages = selectedVariety?.stages || selectedCrop.stages;
    const d = new Date(activeTrack.plantingDate);
    const results = [];
    
    // Fertilizer - 4 weeks after planting
    const fDate = new Date(d);
    fDate.setDate(fDate.getDate() + 28);
    results.push({ label: 'Scheduled Fertilization', date: fDate, icon: <Sprout className="w-3 h-3" /> });

    // Pest Control - 8 weeks after planting
    const pDate = new Date(d);
    pDate.setDate(pDate.getDate() + 60);
    results.push({ label: 'Pest Threshold Scan', date: pDate, icon: <Bug className="w-3 h-3" /> });

    // Duration calculation for Harvest
    const totalMonths = stages.reduce((acc, s) => {
      const m = (s.endMonth - s.startMonth + 12) % 12 + 1;
      return acc + m;
    }, 0);
    const hDate = new Date(d);
    hDate.setMonth(hDate.getMonth() + totalMonths - 1);
    results.push({ label: 'Projected Harvest', date: hDate, icon: <Wheat className="w-3 h-3" /> });

    return results;
  }, [activeTrack, selectedVariety, selectedCrop]);

  // Reset variety when crop changes
  React.useEffect(() => {
    setSelectedVarietyId(null);
  }, [selectedCropId]);

  const getStageAtMonth = (monthIndex: number) => {
    const stages = selectedVariety?.stages || selectedCrop.stages;
    return stages.find(s => {
      if (s.startMonth <= s.endMonth) {
        return monthIndex >= s.startMonth && monthIndex <= s.endMonth;
      } else {
        // Wraps around year end
        return monthIndex >= s.startMonth || monthIndex <= s.endMonth;
      }
    });
  };

  const getStageColor = (stageName: string) => {
    const name = stageName.toLowerCase();
    if (name.includes('plant') || name.includes('sow')) return 'bg-emerald-400';
    if (name.includes('harvest')) return 'bg-amber-400';
    if (name.includes('dormancy')) return 'bg-slate-300';
    return 'bg-sky-400';
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
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: 10, y: 30 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateX: 10, y: 30 }}
            className="relative w-full max-w-5xl bg-[#FAF9F6] rounded-sm shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col md:flex-row max-h-[90vh] overflow-hidden"
          >
            {/* Left Rail - Selection */}
            <div className="w-full md:w-80 bg-[#2D4635] p-6 md:p-8 text-white flex flex-col border-r border-white/10 shrink-0 overflow-y-auto hide-scrollbar">
              <div className="mb-8 md:mb-12">
                <div className="flex items-center justify-between mb-6 md:hidden">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-emerald-400" />
                    <h2 className="font-serif text-2xl italic tracking-tight">Crops</h2>
                  </div>
                  <button onClick={onClose} className="p-2 -mr-2 text-white/50">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="hidden md:flex items-center gap-3 mb-6">
                  <Calendar className="w-6 h-6 text-emerald-400" />
                  <h2 className="font-serif text-2xl italic tracking-tight">Crop Chronos</h2>
                </div>
                
                <p className="hidden md:block text-[10px] uppercase tracking-[0.2em] text-white/40 leading-relaxed">
                  Select a biological asset to view its lifecycle trajectory across the solar cycle.
                </p>
              </div>

              <nav className="flex md:flex-col gap-3 md:gap-4 overflow-x-auto md:overflow-y-auto pb-4 md:pb-0 no-scrollbar">
                {CROPS.map((crop) => (
                  <motion.div
                    key={crop.id}
                    whileHover={{ x: 5 }}
                    onClick={() => setSelectedCropId(crop.id)}
                    className={`cursor-pointer p-4 border rounded-sm transition-all group shrink-0 w-48 md:w-full ${
                      selectedCropId === crop.id 
                        ? 'bg-emerald-400/20 border-emerald-400/50' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-serif italic whitespace-nowrap">{crop.name}</span>
                      {selectedCropId === crop.id && <motion.div layoutId="active-indicator" className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                    </div>
                    <span className="text-[8px] uppercase tracking-[0.2em] opacity-40 block truncate">{crop.scientificName}</span>
                  </motion.div>
                ))}
              </nav>

              <div className="hidden md:block mt-auto pt-12">
                <div className="p-6 bg-black/20 rounded-sm border border-white/5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Info className="w-3 h-3 text-emerald-400" />
                    <span className="text-[9px] uppercase tracking-widest opacity-60">Agronomic Insight</span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-white/40 italic">
                    Lifecycle stages may deviate by ±14 days depending on regional micro-climates.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Visualization */}
            <div className="flex-1 p-6 md:p-12 flex flex-col bg-white overflow-y-auto">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/30 mb-2">Detailed View</h3>
                  <div className="flex flex-wrap items-baseline gap-2 md:gap-4 mb-2">
                    <h4 className="font-serif text-3xl md:text-4xl italic text-[#2D4635]">{selectedCrop.name}</h4>
                    {selectedVariety && (
                      <span className="text-lg md:text-xl font-serif italic text-emerald-600">— {selectedVariety.name}</span>
                    )}
                  </div>
                  <p className="text-sm text-black/50 font-serif italic max-w-lg">
                    {selectedVariety?.description || selectedCrop.description}
                  </p>
                </div>
                <button onClick={onClose} className="hidden md:block p-2 hover:bg-black/5 rounded-full transition-colors">
                  <X className="w-6 h-6 text-black/20" />
                </button>
              </div>

              {/* Variety Selection */}
              {selectedCrop.varieties && (
                <div className="mb-6 p-4 bg-black/[0.02] rounded-sm border border-black/5">
                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-black/40 mb-3 flex items-center gap-2">
                    <Leaf className="w-3 h-3" /> Select Cultivar Variety
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedVarietyId(null)}
                      className={`relative px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-full border transition-all ${
                        selectedVarietyId === null
                          ? 'bg-[#2D4635] text-white border-[#2D4635]'
                          : 'bg-transparent text-black/40 border-black/10 hover:border-black/30'
                      }`}
                    >
                        Baseline
                        {favorites.some(f => f.id === selectedCrop.id) && !selectedVarietyId && (
                          <Heart className="w-2.5 h-2.5 absolute -top-1 -right-1 fill-red-400 text-red-500" />
                        )}
                      </button>
                      {selectedCrop.varieties.map(v => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVarietyId(v.id)}
                          className={`relative px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-full border transition-all ${
                            selectedVarietyId === v.id
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-900/20'
                              : 'bg-transparent text-black/40 border-black/10 hover:border-black/30'
                          }`}
                        >
                          {v.name}
                          {favorites.some(f => f.id === v.id) && (
                            <Heart className="w-2.5 h-2.5 absolute -top-1 -right-1 fill-red-400 text-red-500" />
                          )}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Active Monitoring Section */}
              {activeTrack && (
                <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-1 md:col-span-2 p-6 bg-emerald-50/50 border border-emerald-100 rounded-sm shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Active Growth Monitor</span>
                      </div>
                      {!activeTrack.plantingDate ? (
                        <div className="flex items-center gap-2">
                           <input 
                             type="date" 
                             className="text-[10px] bg-white border border-emerald-200 px-2 py-1 rounded-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                             onChange={(e) => onUpdateTrack(activeTrack.id, { plantingDate: e.target.value })}
                           />
                           <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-tighter">Set Planting Date</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                           <div className="text-right">
                             <p className="text-[8px] uppercase tracking-widest text-emerald-600/60 font-bold">Planted On</p>
                             <p className="text-xs font-serif italic text-emerald-900">{new Date(activeTrack.plantingDate).toLocaleDateString()}</p>
                           </div>
                           <button 
                             onClick={() => onUpdateTrack(activeTrack.id, { plantingDate: undefined })}
                             className="p-1.5 hover:bg-emerald-100 rounded-full text-emerald-600 transition-colors"
                           >
                             <Calendar className="w-3.5 h-3.5" />
                           </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <p className="text-[9px] uppercase tracking-widest font-bold text-emerald-800/40">Registered Growth Milestones</p>
                      <div className="flex flex-wrap gap-2">
                        {(selectedVariety?.stages || selectedCrop.stages).map(s => {
                          const isLogged = activeTrack.loggedStages.some(ls => ls.stage === s.stage);
                          return (
                            <button
                              key={s.stage}
                              onClick={() => {
                                if (isLogged) {
                                  onUpdateTrack(activeTrack.id, { 
                                    loggedStages: activeTrack.loggedStages.filter(ls => ls.stage !== s.stage) 
                                  });
                                } else {
                                  onUpdateTrack(activeTrack.id, { 
                                    loggedStages: [...activeTrack.loggedStages, { stage: s.stage, date: new Date().toISOString() }] 
                                  });
                                }
                              }}
                              className={`px-3 py-1.5 rounded-sm border text-[9px] uppercase tracking-widest font-bold transition-all flex items-center gap-2 ${
                                isLogged 
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                                  : 'bg-white text-emerald-800/60 border-emerald-100 hover:border-emerald-300'
                              }`}
                            >
                              {isLogged && <Check className="w-3 h-3" />}
                              {s.stage}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-[#2D4635] text-white rounded-sm shadow-xl">
                    <div className="flex items-center gap-2 text-emerald-400 mb-6">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-[10px] uppercase tracking-widest font-bold">Predictive Advisory</span>
                    </div>
                    {predictions ? (
                      <div className="space-y-4">
                        {predictions.map((p, i) => (
                          <div key={i} className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-400 group-hover:text-[#2D4635] transition-all">
                              {p.icon}
                            </div>
                            <div>
                              <p className="text-[8px] uppercase tracking-widest text-emerald-100/40 font-bold">{p.label}</p>
                              <p className="text-xs font-serif italic text-emerald-50">{p.date.toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-24 flex flex-col items-center justify-center text-center opacity-40">
                         <Clock className="w-6 h-6 mb-2" />
                         <p className="text-[10px] uppercase tracking-tighter leading-tight px-4">Set planting date to unlock predictive trajectory.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline Grid */}
              <div className="relative mb-12 md:mb-16">
                <div className="overflow-x-auto custom-scrollbar pb-4 md:pb-0">
                  <div className="min-w-[500px]">
                    <div className="grid grid-cols-12 gap-1 border-b border-black/5 pb-2 mb-4">
                      {MONTHS.map((m, i) => (
                        <div 
                          key={m} 
                          className={`text-center transition-all ${hoveredMonth === i ? 'text-[#2D4635]' : 'text-black/20'}`}
                        >
                          <span className="text-[10px] font-bold tracking-widest">{m}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-12 gap-1 h-32 relative group">
                      {/* Vertical Month Dividers */}
                      <div className="absolute inset-0 grid grid-cols-12 gap-1 pointer-events-none">
                        {MONTHS.map((_, i) => (
                          <div key={i} className="h-full border-r border-black/[0.03]" />
                        ))}
                      </div>

                      {/* Stage Blocks */}
                      {MONTHS.map((_, i) => {
                        const stage = getStageAtMonth(i);
                        return (
                          <div 
                            key={i} 
                            className="relative z-10 flex flex-col justify-end p-1 cursor-crosshair pb-4"
                            onMouseEnter={() => setHoveredMonth(i)}
                            onMouseLeave={() => setHoveredMonth(null)}
                          >
                            {stage && (
                              <motion.div 
                                layoutId={`stage-${stage.stage}`}
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                className={`w-full ${getStageColor(stage.stage)} rounded-t-sm relative group/block h-8 shadow-sm`}
                              >
                                <div className="absolute -top-24 left-1/2 -translate-x-1/2 opacity-0 group-hover/block:opacity-100 transition-opacity bg-[#2D4635] text-white p-3 rounded-sm shadow-2xl z-50 w-48 border border-white/10 ring-1 ring-black/20 pointer-events-none">
                                  <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-400 mb-2">{stage.stage}</p>
                                  
                                  {stage.soilMoisture && (
                                    <div className="mb-2">
                                      <p className="text-[8px] uppercase tracking-tighter text-white/40 mb-0.5">Soil Moisture</p>
                                      <p className="text-[10px] font-serif italic leading-tight text-white/90">{stage.soilMoisture}</p>
                                    </div>
                                  )}
                                  
                                  {stage.drainage && (
                                    <div>
                                      <p className="text-[8px] uppercase tracking-tighter text-white/40 mb-0.5">Drainage</p>
                                      <p className="text-[10px] font-serif italic leading-tight text-white/90">{stage.drainage}</p>
                                    </div>
                                  )}
                                  
                                  <div className="w-2.5 h-2.5 bg-[#2D4635] rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-r border-b border-white/10" />
                                </div>
                                {/* Inner 3D glow */}
                                <div className="absolute inset-0 bg-white/20 blur-[1px] opacity-50" />
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-x-8 gap-y-4 mt-6">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                     <span className="text-[9px] uppercase tracking-widest text-black/40">Planting/Sowing</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-sky-400 rounded-full" />
                     <span className="text-[9px] uppercase tracking-widest text-black/40">Vegetative/Growth</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-amber-400 rounded-full" />
                     <span className="text-[9px] uppercase tracking-widest text-black/40">Harvest/Maturity</span>
                   </div>
                   {selectedCrop.id === '1' && (selectedVarietyId === '1-1' || selectedVarietyId === '1-3') && (
                     <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-slate-300 rounded-full" />
                       <span className="text-[9px] uppercase tracking-widest text-black/40">Winter Dormancy</span>
                     </div>
                   )}
                </div>
              </div>

              {/* Stats Footer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-black/5 mt-auto">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Ideal Conditions</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-black/5 rounded-sm">
                      <p className="text-[8px] uppercase tracking-widest text-black/40 mb-1">pH Range</p>
                      <p className="font-serif italic text-lg">{selectedCrop.idealPH}</p>
                    </div>
                    <div className="p-4 bg-black/5 rounded-sm">
                      <p className="text-[8px] uppercase tracking-widest text-black/40 mb-1">Water Need</p>
                      <p className="font-serif italic text-lg">{selectedCrop.id === '3' ? 'High' : 'Moderate'}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[9px] uppercase tracking-widest font-bold text-black/40">Symbiotic Companions</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {selectedCrop.companionPlants.map(plant => (
                        <div 
                          key={plant.name} 
                          className="relative group/companion"
                        >
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-sm group-hover/companion:bg-emerald-100 group-hover/companion:border-emerald-200 transition-all cursor-help">
                            <Users className="w-2.5 h-2.5 text-emerald-700" />
                            <span className="text-[9px] font-bold text-emerald-800 tracking-tight">{plant.name}</span>
                          </div>
                          
                          {/* Explanation Tooltip */}
                          <AnimatePresence>
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              whileHover={{ opacity: 1, y: 0, scale: 1 }}
                              className="absolute bottom-full left-0 mb-3 w-64 opacity-0 group-hover/companion:opacity-100 pointer-events-none transition-all z-50 origin-bottom-left"
                            >
                              <div className="bg-[#2D4635] text-white p-4 rounded-sm shadow-2xl border border-white/10 ring-1 ring-black/20">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="p-1 bg-emerald-400/20 rounded-full">
                                    {plant.category === 'Nitrogen Fixation' && <Sprout className="w-2.5 h-2.5 text-emerald-400" />}
                                    {plant.category === 'Pest Deterrence' && <Search className="w-2.5 h-2.5 text-emerald-400" />}
                                    {plant.category === 'Trap Crop' && <Search className="w-2.5 h-2.5 text-emerald-400" />}
                                    {plant.category === 'Growth Enhancement' && <Heart className="w-2.5 h-2.5 text-emerald-400" />}
                                    {plant.category === 'Moisture Retention' && <Leaf className="w-2.5 h-2.5 text-emerald-400" />}
                                    {plant.category === 'Structural Support' && <Wheat className="w-2.5 h-2.5 text-emerald-400" />}
                                  </div>
                                  <span className="text-[8px] uppercase tracking-widest font-bold text-emerald-400">{plant.category}</span>
                                </div>
                                <p className="text-[11px] leading-relaxed font-serif italic text-white/90">
                                  {plant.benefit}
                                </p>
                              </div>
                              <div className="w-2.5 h-2.5 bg-[#2D4635] rotate-45 absolute -bottom-1.5 left-4 border-r border-b border-white/10" />
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">System Integration</span>
                  </div>
                  <button 
                    onClick={() => onToggleFavorite(selectedVariety?.id || selectedCrop.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-black/10 rounded-sm hover:bg-black/[0.02] transition-all group"
                  >
                    <Heart className={`w-4 h-4 transition-colors ${
                      favorites.some(f => f.id === (selectedVariety?.id || selectedCrop.id)) 
                        ? 'fill-red-400 text-red-500' 
                        : 'text-black/20 group-hover:text-red-400'
                    }`} />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-black/40">
                      {favorites.some(f => f.id === (selectedVariety?.id || selectedCrop.id)) ? 'In My Crops' : 'Add to Collection'}
                    </span>
                  </button>
                  
                  <button 
                    onClick={() => onQueryCrop(`Provide a complete cultivation guide for ${selectedCrop.name}${selectedVariety ? ` (Variety: ${selectedVariety.name})` : ''}. Include specifics on ${selectedVariety ? 'this cultivar\'s unique requirements' : 'general best practices'}.`)}
                    className="w-full flex items-center justify-between p-4 bg-[#2D4635] text-white rounded-sm hover:translate-x-1 transition-all group overflow-hidden relative"
                  >
                    <div className="relative z-10 flex items-center gap-3">
                      <Wheat className="w-4 h-4" />
                      <span className="text-[10px] uppercase tracking-widest font-bold">Run Variety Analysis</span>
                    </div>
                    <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-emerald-400 translate-x-[-100%] group-hover:translate-x-[-90%] transition-transform opacity-10" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
