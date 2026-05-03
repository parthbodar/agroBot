/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  UserCheck, 
  Send, 
  Loader2, 
  FileText, 
  Activity, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  LandPlot,
  Sprout
} from 'lucide-react';
import { db, auth, addDoc, serverTimestamp, OperationType, handleFirestoreError } from '../services/firebase';
import { collection } from 'firebase/firestore';

interface ExpertConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionTitle: string;
  sessionHistory?: string;
  attachedImages?: string[];
  diagnosticSummary?: any;
}

export default function ExpertConsultationModal({ 
  isOpen, 
  onClose, 
  sessionTitle,
  sessionHistory,
  attachedImages = [],
  diagnosticSummary
}: ExpertConsultationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    cropType: '',
    duration: '',
    summary: '',
    priority: 'Standard'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("Sign in required to submit dossiers.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'consultations'), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        userName: auth.currentUser.displayName || "Anonymous Farmer",
        subject: `${formData.cropType} Diagnostic Request`,
        details: formData.summary,
        sessionHistory: sessionHistory || "No history provided",
        attachedImages: attachedImages,
        diagnosticSummary: diagnosticSummary || null,
        cropType: formData.cropType,
        location: formData.duration,
        priority: formData.priority,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      setIsSubmitted(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'consultations');
    } finally {
      setIsSubmitting(false);
    }
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
                <UserCheck className="w-5 h-5" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Specialist Escalation</span>
              </div>
              <h2 className="font-serif text-3xl italic tracking-tight text-[#1A1A1A]">Consult human agronomist</h2>
              <p className="text-xs text-black/40 mt-2 font-serif italic">Securely submit your query to our vetted agricultural expert network.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-black/5 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-black/40" />
            </button>
          </div>

          <div className="overflow-y-auto p-8 flex-1">
            {isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="font-serif text-2xl italic mb-3">Transmission Successful</h3>
                <p className="text-sm text-black/60 max-w-md mx-auto mb-8 font-serif leading-relaxed">
                  Your agricultural dossier has been encrypted and shared with our specialist network. An agronomist will review your case within 24-48 business hours.
                </p>
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-sm flex items-center gap-4 text-left max-w-sm mx-auto mb-8">
                   <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
                   <div>
                     <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-800">Review Status</p>
                     <p className="text-[11px] text-emerald-700 font-serif italic">Pending Professional Assignment</p>
                   </div>
                </div>
                <button 
                  onClick={onClose}
                  className="px-8 py-3 bg-[#2D4635] text-white text-[10px] uppercase tracking-widest font-bold rounded-sm hover:bg-emerald-900 transition-all shadow-xl"
                >
                  Return to Dashboard
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Session Context */}
                <div className="flex flex-col gap-4">
                  <div className="p-4 bg-black/5 rounded-sm border border-black/5 flex items-start gap-4">
                    <div className="p-2 bg-white rounded-full shadow-sm">
                      <FileText className="w-4 h-4 text-black/40" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[8px] uppercase tracking-widest font-bold text-black/30 mb-1">Dossier Context</p>
                      <p className="text-sm font-serif italic text-black/80">{sessionTitle}</p>
                      <p className="text-[9px] text-black/40 mt-1 uppercase tracking-tighter">AI Session history is automatically attached</p>
                    </div>
                  </div>

                  {(attachedImages.length > 0 || diagnosticSummary) && (
                    <div className="p-4 border border-emerald-100 bg-emerald-50/30 rounded-sm">
                      <p className="text-[9px] uppercase tracking-widest font-bold text-emerald-800/40 mb-3">Included Assets</p>
                      <div className="flex flex-wrap gap-3">
                        {attachedImages.map((img, i) => (
                          <div key={i} className="w-12 h-12 rounded-sm border border-black/5 overflow-hidden shadow-sm">
                            <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {diagnosticSummary && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-sm border border-emerald-100 shadow-sm">
                            <Activity className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[10px] font-bold text-emerald-800">{diagnosticSummary.title} Report</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest font-bold text-black/40 flex items-center gap-2">
                      <Sprout className="w-3 h-3" /> Crop Variety
                    </label>
                    <input 
                      required
                      type="text"
                      value={formData.cropType}
                      onChange={e => setFormData({...formData, cropType: e.target.value})}
                      placeholder="e.g. Heirloom Tomato, Winter Wheat"
                      className="w-full bg-white border border-black/10 p-3 text-sm font-serif italic focus:outline-none focus:border-emerald-600 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest font-bold text-black/40 flex items-center gap-2">
                      <LandPlot className="w-3 h-3" /> Area / Location
                    </label>
                    <input 
                      required
                      type="text"
                      value={formData.duration}
                      onChange={e => setFormData({...formData, duration: e.target.value})}
                      placeholder="e.g. North Acre, Plot 12B"
                      className="w-full bg-white border border-black/10 p-3 text-sm font-serif italic focus:outline-none focus:border-emerald-600 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-black/40 flex items-center gap-2">
                    <Activity className="w-3 h-3" /> Challenge Summary
                  </label>
                  <textarea 
                    required
                    rows={4}
                    value={formData.summary}
                    onChange={e => setFormData({...formData, summary: e.target.value})}
                    placeholder="Describe the specific problem or unique situation that requires human expert review..."
                    className="w-full bg-white border border-black/10 p-3 text-sm font-serif italic focus:outline-none focus:border-emerald-600 transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-4">
                    <label className="text-[9px] uppercase tracking-widest font-bold text-black/40">Urgency Level</label>
                    <div className="flex gap-2">
                      {['Standard', 'Urgent'].map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFormData({...formData, priority: p})}
                          className={`px-3 py-1 text-[8px] uppercase tracking-widest font-bold border transition-all ${
                            formData.priority === p 
                              ? 'bg-[#2D4635] text-white border-[#2D4635]' 
                              : 'bg-white text-black/40 border-black/10 hover:border-black/30'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    disabled={isSubmitting}
                    className="flex items-center gap-3 px-8 py-3 bg-[#2D4635] text-white text-[10px] uppercase tracking-widest font-bold rounded-sm shadow-xl hover:bg-emerald-900 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transmitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Dossier</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 bg-emerald-50 rounded-sm flex items-start gap-4">
                  <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[9px] text-emerald-800/70 leading-relaxed font-serif italic">
                    By submitting this consultation, you agree to share the current session history and any uploaded diagnostic imagery with our certified partner specialists for the purpose of agronomic review.
                  </p>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
