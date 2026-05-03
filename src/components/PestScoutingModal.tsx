/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Camera, 
  Upload, 
  ShieldAlert, 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  Search,
  ArrowRight,
  Bug,
  Activity,
  Info,
  Beaker,
  Thermometer,
  Leaf
} from 'lucide-react';
import { analyzeCropImages, UserProfile } from '../services/geminiService';
import { PESTS } from './PestDatabaseModal';
import { getMarkerIcon } from './DiagnosticIcons';

interface PestScoutingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile;
  onOpenDatabaseEntry: (pestId: string) => void;
}

type ScoutingStep = 'upload' | 'analyzing' | 'result';

const DIAGNOSIS_THEMES = {
  pest: { icon: <Bug className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', label: 'Entomological Threat' },
  disease: { icon: <Beaker className="w-4 h-4" />, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', label: 'Pathological Detection' },
  nutritional: { icon: <Thermometer className="w-4 h-4" />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', label: 'Nutrient Deficiency' },
  healthy: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'Baseline Stability' },
  unknown: { icon: <Search className="w-4 h-4" />, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', label: 'Diagnostic Anomaly' },
};

export default function PestScoutingModal({ 
  isOpen, 
  onClose, 
  userProfile,
  onOpenDatabaseEntry
}: PestScoutingModalProps) {
  const [step, setStep] = useState<ScoutingStep>('upload');
  const [selectedImages, setSelectedImages] = useState<{ data: string; mimeType: string; preview: string }[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: { data: string; mimeType: string; preview: string }[] = [];
    let processedFiles = 0;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        setError("Please upload valid image files.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        newImages.push({
          data: base64.split(',')[1],
          mimeType: file.type,
          preview: base64
        });
        processedFiles++;
        if (processedFiles === files.length) {
          setSelectedImages(prev => [...prev, ...newImages]);
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const startAnalysis = async () => {
    if (selectedImages.length === 0) return;

    setStep('analyzing');
    try {
      const result = await analyzeCropImages(selectedImages, userProfile);
      setAnalysisResult(result);
      setStep('result');
    } catch (err) {
      console.error(err);
      setError("Failed to analyze images. Please try again.");
      setStep('upload');
    }
  };

  const reset = () => {
    setStep('upload');
    setSelectedImages([]);
    setAnalysisResult(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-[#2D4635]/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#FAF9F6] w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden border border-black/10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-8 border-b border-black/5 bg-white flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 text-emerald-700 mb-2">
                <Camera className="w-5 h-5" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Field Diagnostics</span>
              </div>
              <h2 className="font-serif text-3xl italic tracking-tight text-[#1A1A1A]">Crop Diagnostic Assistant</h2>
              <p className="text-xs text-black/40 mt-2 font-serif italic">AI vision optimized for identifying pests, diseases, and nutrient deficiencies relative to your farm profile.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-black/5 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-black/40" />
            </button>
          </div>

          <div className="overflow-y-auto p-8 flex-1">
            {step === 'upload' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {selectedImages.length === 0 ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-black/10 rounded-sm p-12 text-center hover:border-emerald-500/50 hover:bg-emerald-50/10 cursor-pointer transition-all group"
                  >
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="font-serif text-xl italic mb-2">Capture or Upload Sample(s)</h3>
                    <p className="text-sm text-black/40 max-w-xs mx-auto font-serif">Upload clear photos of the pest or crop damage for AI identification. You can upload multiple images for better accuracy.</p>
                    <input 
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      multiple
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedImages.map((img, idx) => (
                        <div key={idx} className="relative aspect-square bg-black rounded-sm overflow-hidden shadow-md group">
                          <img 
                            src={img.preview} 
                            alt={`Scouting Preview ${idx}`} 
                            className="w-full h-full object-cover"
                          />
                          <button 
                            onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-black/10 rounded-sm flex flex-col items-center justify-center gap-2 hover:bg-black/5 transition-all text-black/40"
                      >
                        <Upload className="w-5 h-5" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Add More</span>
                        <input 
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          multiple
                        />
                      </button>
                    </div>
                    
                    <div className="flex flex-col items-center gap-6">
                      <div className="flex items-center justify-center gap-4">
                        <button 
                          onClick={() => setSelectedImages([])}
                          className="px-6 py-3 border border-black/10 text-[10px] uppercase tracking-widest font-bold hover:bg-black/5 transition-all"
                        >
                          Clear All
                        </button>
                        <button 
                          onClick={startAnalysis}
                          className="px-8 py-3 bg-[#2D4635] text-white text-[10px] uppercase tracking-widest font-bold shadow-xl hover:bg-emerald-900 transition-all flex items-center gap-3"
                        >
                          Identify Pest Specimen(s)
                          <Bug className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap justify-center gap-3">
                        <button 
                          onClick={() => {
                            // Close modal and pass images+prompt to ChatInterface
                            onClose();
                            window.dispatchEvent(new CustomEvent('agrobot_quick_action', { 
                              detail: { 
                                prompt: "Please perform a comprehensive health diagnostic on these images. Identify symptoms, pathogens, and mitigation steps.",
                                images: selectedImages
                              }
                            }));
                          }}
                          className="px-4 py-2 bg-emerald-50 text-emerald-700 text-[9px] uppercase tracking-[0.15em] font-bold border border-emerald-200 hover:bg-emerald-100 transition-all rounded-sm flex items-center gap-2"
                        >
                          <Activity className="w-3 h-3" />
                          General Health Audit
                        </button>
                        <button 
                          onClick={() => {
                            onClose();
                            window.dispatchEvent(new CustomEvent('agrobot_quick_action', { 
                              detail: { 
                                prompt: "Please identify this plant species/variety and assess its growth stage based on these images.",
                                images: selectedImages
                              }
                            }));
                          }}
                          className="px-4 py-2 bg-sky-50 text-sky-700 text-[9px] uppercase tracking-[0.15em] font-bold border border-sky-200 hover:bg-sky-100 transition-all rounded-sm flex items-center gap-2"
                        >
                          <Leaf className="w-3 h-3" />
                          Identify Species
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-sm flex items-start gap-4 text-red-800">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-xs font-serif italic">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-sm">
                    <div className="flex items-center gap-2 mb-2 text-emerald-800">
                      <Info className="w-3 h-3" />
                      <span className="text-[8px] uppercase tracking-widest font-bold">Best Practices</span>
                    </div>
                    <p className="text-[10px] text-emerald-900/60 leading-relaxed font-serif italic">Ensure natural lighting and get as close as possible to the specimen. Focus on identifying markers like wings, legs, or unique damage patterns.</p>
                  </div>
                  <div className="p-4 bg-[#2D4635]/5 border border-black/5 rounded-sm">
                    <div className="flex items-center gap-2 mb-2 text-black/40">
                      <ShieldAlert className="w-3 h-3" />
                      <span className="text-[8px] uppercase tracking-widest font-bold">Privacy</span>
                    </div>
                    <p className="text-[10px] text-black/40 leading-relaxed font-serif italic">Images are processed via secure analysis layers and are only used for the duration of this diagnostic session unless escalated to an expert.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'analyzing' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 space-y-8"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-100 rounded-full blur-3xl opacity-20 animate-pulse" />
                  <div className="w-24 h-24 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin flex items-center justify-center">
                    <Bug className="w-10 h-10 text-emerald-600/20" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-serif text-2xl italic mb-2">Analyzing Morphology...</h3>
                  <p className="text-sm text-black/40 font-serif italic">Cross-referencing attributes with pest database and regional alerts.</p>
                </div>
                <div className="w-full max-w-xs space-y-3">
                  <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="h-full w-1/2 bg-emerald-600 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-[8px] uppercase tracking-widest font-bold text-black/30">
                    <span>Taxonomy Scan</span>
                    <span>78% Complete</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'result' && analysisResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-start gap-6">
                  <div className="w-32 flex flex-col gap-2 shrink-0">
                    <div className="w-32 h-32 rounded-sm overflow-hidden shadow-xl border border-black/10">
                      <img 
                        src={selectedImages[0]?.preview} 
                        alt="Sample" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {selectedImages.length > 1 && (
                      <p className="text-[8px] uppercase tracking-widest text-center text-black/40 font-bold">
                        + {selectedImages.length - 1} more assets
                      </p>
                    )}
                  </div>
                  <div className="flex-1 pt-2">
                    <div className={`flex items-center gap-2 mb-1 ${(DIAGNOSIS_THEMES[analysisResult.diagnosisType as keyof typeof DIAGNOSIS_THEMES] || DIAGNOSIS_THEMES.unknown).color}`}>
                      {(DIAGNOSIS_THEMES[analysisResult.diagnosisType as keyof typeof DIAGNOSIS_THEMES] || DIAGNOSIS_THEMES.unknown).icon}
                      <span className="text-[10px] uppercase tracking-widest font-bold">
                        {(DIAGNOSIS_THEMES[analysisResult.diagnosisType as keyof typeof DIAGNOSIS_THEMES] || DIAGNOSIS_THEMES.unknown).label}
                      </span>
                    </div>
                    <h3 className="font-serif text-3xl italic text-[#1A1A1A] leading-tight">{analysisResult.name}</h3>
                    <p className="text-sm text-black/40 font-serif italic mt-1">{analysisResult.scientificName}</p>
                    
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <div className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] uppercase tracking-widest font-bold rounded-sm">
                        Confidence: {(analysisResult.confidence * 100).toFixed(0)}%
                      </div>
                      {analysisResult.urgentAction && (
                        <div className="px-3 py-1 bg-red-100 text-red-800 text-[10px] uppercase tracking-widest font-bold rounded-sm flex items-center gap-2">
                          <ShieldAlert className="w-3 h-3" />
                          Urgent Priority
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/30">AI Analysis</h4>
                    <p className="text-sm text-black/70 font-serif italic leading-relaxed bg-white p-4 border border-black/5 rounded-sm shadow-sm">
                      {analysisResult.analysis}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2D4635]/60">Personalized Context</h4>
                    <div className="p-4 bg-emerald-50/30 border border-emerald-100/50 rounded-sm shadow-sm">
                      <div className="flex items-center gap-2 mb-3 text-emerald-800">
                        <Leaf className="w-3 h-3" />
                        <span className="text-[9px] uppercase tracking-widest font-bold">Recommendations</span>
                      </div>
                      <p className="text-sm text-[#2D4635] font-serif italic leading-relaxed">
                        {analysisResult.personalizedAdvice}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/30">Diagnostic Evidence</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysisResult.keyObservations.map((obs: string, i: number) => (
                      <div key={i} className="p-3 bg-white border border-black/5 rounded-sm flex items-center gap-3 shadow-sm font-serif italic text-sm text-black/70 items-start">
                        <div className="shrink-0 text-emerald-600/60 mt-0.5">
                          {getMarkerIcon(obs, <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full shadow-[0_0_8px_rgba(5,150,105,0.4)] mt-1.5" />)}
                        </div>
                        {obs}
                      </div>
                    ))}
                  </div>
                </div>

                {analysisResult.urgentAction && (
                  <div className="p-5 bg-red-50 border border-red-100 rounded-sm">
                    <div className="flex items-center gap-2 text-red-800 mb-2">
                      <ShieldAlert className="w-4 h-4" />
                      <span className="text-[10px] uppercase tracking-widest font-bold">Countermask Protocol</span>
                    </div>
                    <p className="text-sm font-serif italic text-red-900/80 leading-relaxed">{analysisResult.urgentAction}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-black/5 space-y-4">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-black/30">Integrated Action Plan</p>
                  
                  {analysisResult.suggestedDatabaseMatch !== 'unknown' ? (
                    <div className="flex flex-col md:flex-row gap-4">
                      <button 
                        onClick={() => {
                          const match = PESTS.find(p => p.id === analysisResult.suggestedDatabaseMatch || p.name.toLowerCase().includes(analysisResult.suggestedDatabaseMatch.toLowerCase()));
                          if (match) {
                            onOpenDatabaseEntry(match.id);
                          } else {
                            // Fallback to searching database
                            onOpenDatabaseEntry('1'); // Just as example, should ideally handle search
                          }
                        }}
                        className="flex-1 flex items-center justify-between p-4 bg-[#2D4635] text-white rounded-sm hover:bg-emerald-900 transition-all group shadow-xl"
                      >
                        <div className="text-left">
                          <p className="text-[8px] uppercase tracking-widest font-bold text-emerald-400/80 mb-1">Database Match Found</p>
                          <p className="text-[15px] font-serif italic">View Full Control Protocol</p>
                        </div>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                      
                      <button 
                        onClick={reset}
                        className="flex-1 p-4 border border-black/10 rounded-sm hover:bg-black/5 transition-all text-center"
                      >
                        <p className="text-[8px] uppercase tracking-widest font-bold text-black/30 mb-1">Inaccurate?</p>
                        <p className="text-[15px] font-serif italic">Perform New Search</p>
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 bg-white border border-black/10 rounded-sm text-center">
                      <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-6 h-6 text-black/20" />
                      </div>
                      <h4 className="font-serif text-xl italic mb-2">No direct database match</h4>
                      <p className="text-sm text-black/40 font-serif italic mb-6">Our AI identified the specimen, but it doesn't align exactly with our current high-priority pest list.</p>
                      <button 
                        onClick={onClose}
                        className="px-8 py-3 bg-[#2D4635] text-white text-[10px] uppercase tracking-widest font-bold rounded-sm shadow-xl hover:bg-emerald-900 transition-all"
                      >
                        Escalate to Expert
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
