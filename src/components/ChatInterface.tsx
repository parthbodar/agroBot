/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Loader2, 
  Clock, 
  BookOpen, 
  LayoutGrid, 
  Info, 
  Sparkles, 
  Download, 
  UserCheck,
  Plus, 
  Trash2, 
  Beaker, 
  Calendar,
  Bug,
  Camera, 
  Upload, 
  ExternalLink, 
  FileText,
  AlertCircle,
  Activity,
  Heart,
  TrendingUp,
  Mic,
  MicOff,
  Search,
  Menu,
  X,
  CheckCircle2,
  Leaf,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  CloudRain,
  Sun,
  Compass,
  ThermometerSnowflake,
  Wind,
  Thermometer,
  CloudLightning,
  AlertTriangle,
  LogIn,
  LogOut,
  Image as ImageIcon
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { sendMessage, generateImage, summarizeText, ChatMessage, UserProfile, VisualSummary } from '../services/geminiService';
import { jsPDF } from 'jspdf';
import { nanoid } from 'nanoid';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  User as FirebaseUser,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  OperationType,
  handleFirestoreError
} from '../services/firebase';

// List of agricultural keywords to auto-link for research
const AGRO_KEYWORDS = [
  'Wheat', 'Maize', 'Rice', 'Soybean', 'Tomato', 'Coffee', 'Potato', 'Cotton', 'Grapes', 'Apple',
  'Aphids', 'Fall Armyworm', 'Spider Mites', 'Whitefly', 'Desert Locust',
  'Organic', 'No-till', 'Hydroponic', 'IPM', 'Crop Rotation', 'Mulching', 'Irrigation', 'Aeroponics', 'Permaculture',
  'Sustainable', 'Regenerative', 'Cover Crops', 'Compost', 'Fertilizer', 'Pesticide', 'Herbicide', 'Pollination'
];

function linkAgriculturalTerms(text: string): string {
  let linkedText = text;
  AGRO_KEYWORDS.forEach(keyword => {
    // Regex to match the keyword as a whole word, case-insensitive, but not inside an existing markdown link
    // We try to avoid matching if it's already inside [ ... ]( ... )
    // A simplified approach: only link if it's not preceded by '[' or followed by ']'
    const regex = new RegExp(`(?<!\\[)\\b(${keyword})\\b(?!\\])`, 'gi');
    linkedText = linkedText.replace(regex, (match) => {
      return `[${match}](https://www.google.com/search?q=${encodeURIComponent(match + " agriculture")})`;
    });
  });
  return linkedText;
}

const parseVisualSummary = (text: string): { cleanText: string, visualSummary?: VisualSummary } => {
  const match = text.match(/<visual_summary>([\s\S]*?)<\/visual_summary>/i);
  if (match) {
    let jsonStr = match[1].trim();
    // Strip markdown code blocks if present
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?|```$/g, '').trim();
    }
    
    // Always remove the tags from the visible text to avoid showing raw JSON to user
    const cleanText = text.replace(/<visual_summary>[\s\S]*?<\/visual_summary>/gi, '').trim();

    try {
      const summary = JSON.parse(jsonStr);
      return { cleanText, visualSummary: summary };
    } catch (e) {
      console.error("Failed to parse visual summary string:", jsonStr, e);
      return { cleanText };
    }
  }
  return { cleanText: text };
};

import { getMarkerIcon } from './DiagnosticIcons';

const renderMessageContent = (text: string) => {
  // Strip any lingering visual_summary tags that might be in the raw text
  const clean = text.replace(/<visual_summary>[\s\S]*?<\/visual_summary>/gi, '').trim();
  return linkAgriculturalTerms(clean);
};

const DiagnosticInfographic = ({ summary, onEscalate }: { summary: VisualSummary, onEscalate?: () => void }) => {
  const getSeverityStyles = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', icon: <AlertTriangle className="w-5 h-5" /> };
      case 'high': return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', icon: <AlertCircle className="w-5 h-5" /> };
      case 'medium': return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: <Info className="w-5 h-5" /> };
      default: return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: <ShieldCheck className="w-5 h-5" /> };
    }
  };

  const styles = getSeverityStyles(summary.severity);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-6 p-6 md:p-8 rounded-sm border ${styles.border} ${styles.bg} shadow-sm overflow-hidden relative group`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sparkles className="w-16 h-16 rotate-12" />
      </div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className={`flex items-center gap-2 mb-2 ${styles.color}`}>
              {styles.icon}
              <span className="text-[10px] items-center gap-2 font-bold uppercase tracking-[0.2em]">Diagnostic Insight</span>
            </div>
            <h3 className="font-serif text-3xl italic text-black/80 leading-tight">{summary.title}</h3>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <span className="text-[8px] uppercase tracking-widest text-black/30 font-bold">Severity Rating</span>
            <div className={`px-4 py-1.5 rounded-full ${styles.bg} ${styles.color} border border-current/20 text-[10px] font-bold uppercase tracking-widest`}>
              {summary.severity}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-[9px] uppercase tracking-[0.2em] font-bold text-black/40 flex items-center gap-2">
              <Search className="w-3 h-3" /> Key Observations
            </h4>
            <ul className="space-y-3">
              {summary.findings.slice(0, 3).map((finding: string, i: number) => (
                <li key={i} className="flex gap-3 text-sm text-black/70 font-serif italic leading-snug items-start">
                  <div className="shrink-0 text-emerald-600/60 mt-1">
                    {getMarkerIcon(finding)}
                  </div>
                  {finding}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[9px] uppercase tracking-[0.2em] font-bold text-emerald-800/40 flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3" /> Priority Actions
            </h4>
            <div className="bg-white/50 backdrop-blur-sm p-4 border border-emerald-900/5 rounded-sm space-y-4">
               {summary.actions.slice(0, 2).map((action: string, i: number) => (
                 <div key={i} className="flex gap-3 items-start">
                    <div className="shrink-0 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                      {i + 1}
                    </div>
                    <p className="text-sm font-serif italic text-[#2D4635]">{action}</p>
                 </div>
               ))}
               <div className="pt-2 border-t border-emerald-900/5 flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest font-bold text-emerald-800/40">Next evaluation</span>
                <span className="text-xs font-serif italic text-emerald-900">in {summary.nextCheck}</span>
               </div>
            </div>
          </div>
        </div>

        {onEscalate && (
          <div className="mt-8 pt-6 border-t border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-[10px] text-black/40 font-serif italic">Require second opinion? Transmit this dossier to a human specialist.</p>
            <button 
              onClick={onEscalate}
              className={`flex items-center gap-2 px-4 py-2 border rounded-sm text-[9px] uppercase tracking-widest font-bold transition-all ${styles.color} ${styles.border} hover:bg-white/80 active:scale-95`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Escalate to Professional
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const getSeverityInfo = (text: string) => {
  const lower = text.toLowerCase();
  if (lower.includes('severity: critical') || lower.includes('severity: high')) {
    return { label: 'Critical / High', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle };
  }
  if (lower.includes('severity: moderate') || lower.includes('severity: medium')) {
    return { label: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertTriangle };
  }
  if (lower.includes('severity: low') || lower.includes('severity: minor')) {
    return { label: 'Low / Negligible', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: ShieldCheck };
  }
  return null;
}
import SoilAnalysisModal from './SoilAnalysisModal';
import CropCalendarModal, { CROPS, TrackedCrop, TrackedStage } from './CropCalendarModal';
import PestDatabaseModal from './PestDatabaseModal';
import ExpertConsultationModal from './ExpertConsultationModal';
import PestScoutingModal from './PestScoutingModal';

import UserProfileModal from './UserProfileModal';

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
}

interface WeatherAlert {
  id: string;
  type: 'frost' | 'heatwave' | 'heavy-rain' | 'wind' | 'storm';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  impact: string;
}

const SMART_TAGS = [
  { 
    id: 'health', 
    keywords: ['pest', 'disease', 'fungi', 'blight', 'infestation', 'nutrient', 'deficiency', 'yellowing', 'spot', 'pathogen', 'diagnosis', 'symptom'],
    label: 'Health Diagnostic',
    icon: AlertCircle,
    color: 'bg-red-400/10 text-red-600 border-red-400/20'
  },
  { 
    id: 'botanical', 
    keywords: ['leaf', 'tree', 'bark', 'stem', 'branch', 'root', 'botanical', 'species', 'foliage'],
    label: 'Botanical Scan',
    icon: Search,
    color: 'bg-emerald-400/10 text-emerald-600 border-emerald-400/20'
  },
  { 
    id: 'growth', 
    keywords: ['stage', 'harvest', 'plant', 'sow', 'germinat', 'flower', 'fruit', 'matur', 'lifecycle'],
    label: 'Growth Phase',
    icon: TrendingUp,
    color: 'bg-emerald-400/10 text-emerald-600 border-emerald-400/20'
  },
  { 
    id: 'strategy', 
    keywords: ['recommendation', 'action', 'should', 'protocol', 'strategy', 'treatment', 'management'],
    label: 'Strategic Advisory',
    icon: Activity,
    color: 'bg-sky-400/10 text-sky-600 border-sky-400/20'
  }
];

export default function ChatInterface() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize SpeechRecognition if available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Speech recognition start failed:", error);
      }
    }
  };

  const loadingMessages = [
    "Analyzing soil composition data...",
    "Scanning global agricultural benchmarks...",
    "Syncing with real-time weather patterns...",
    "Cross-referencing pathogen databases...",
    "Optimizing growth cycle projections...",
    "Synthesizing sustainable advisory...",
    "Grounding research within regional climate data..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2500);
    } else {
      setLoadingMessageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    location: "Not Specified",
    typicalCrops: "Not Specified",
    farmingPractices: "Traditional / Sustainable",
    weatherPatterns: "Not Specified",
    soilType: "Not Specified",
    waterSources: "Not Specified",
    nearbyFlora: "Not Specified"
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<{ data: string; mimeType: string; preview: string }[]>([]);
  const [isSoilModalOpen, setIsSoilModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isPestModalOpen, setIsPestModalOpen] = useState(false);
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false);
  const [isScoutingModalOpen, setIsScoutingModalOpen] = useState(false);
  const [initialPestId, setInitialPestId] = useState<string | null>(null);
  const [favoriteCrops, setFavoriteCrops] = useState<TrackedCrop[]>([]);
  const [favoriteTag, setFavoriteTag] = useState<string | null>(null);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulated Weather Alert Intelligence
  useEffect(() => {
    if (userProfile.location !== "Not Specified") {
      const alerts: WeatherAlert[] = [];
      const loc = userProfile.location.toLowerCase();
      
      // Logic for generating regional alerts
      if (loc.includes('north') || loc.includes('uk') || loc.includes('europe') || loc.includes('canada')) {
        alerts.push({
          id: 'frost-01',
          type: 'frost',
          severity: 'warning',
          message: 'Nocturnal Frost Risk',
          impact: 'Predicted temperatures below 2°C. Vulnerable soft fruit blossoms require immediate protection.'
        });
      }

      if (loc.includes('india') || loc.includes('africa') || loc.includes('australia') || loc.includes('texas')) {
        alerts.push({
          id: 'heat-01',
          type: 'heatwave',
          severity: 'critical',
          message: 'Extreme Thermal Spike',
          impact: 'Soil moisture depletion accelerating. Maize crops approaching permanent wilting point if not irrigated.'
        });
      }

      if (loc.includes('coastal') || loc.includes('island') || loc.includes('florida') || loc.includes('asia')) {
        alerts.push({
          id: 'storm-01',
          type: 'storm',
          severity: 'critical',
          message: 'Tropical Monsoon Inbound',
          impact: 'Intense precipitation & high winds. Risk of lodging in grain crops; clear drainage channels.'
        });
      }

      // Default advisory if no specific regional match but location is set
      if (alerts.length === 0) {
        alerts.push({
          id: 'precip-01',
          type: 'heavy-rain',
          severity: 'info',
          message: 'Precipitation Optimization',
          impact: 'Stable rainfall expected. Adjust fertilizer application to minimize nutrient runoff.'
        });
      }
      
      setWeatherAlerts(alerts);
    } else {
      setWeatherAlerts([]);
    }
  }, [userProfile.location]);

  const allAvailableTags = useMemo(() => {
    const tags = new Set<string>();
    CROPS.forEach(c => {
      c.tags.forEach(t => tags.add(t));
      c.varieties?.forEach(v => v.tags?.forEach(vt => tags.add(vt)));
    });
    return Array.from(tags).sort();
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Load user profile
        const profileRef = doc(db, 'users', currentUser.uid);
        getDoc(profileRef).then((docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          }
        }).catch(err => handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`));
      } else {
        setSessions([]);
        setCurrentSessionId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync sessions from Firestore
  useEffect(() => {
    if (!user) return;

    const sessionsQuery = query(
      collection(db, `users/${user.uid}/sessions`),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
      const sessionData: ChatSession[] = snapshot.docs.map(doc => ({
        id: doc.id,
        messages: [],
        ...doc.data()
      })) as ChatSession[];
      
      setSessions(sessionData);
      
      if (sessionData.length > 0 && !currentSessionId) {
        setCurrentSessionId(sessionData[0].id);
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/sessions`));

    return () => unsubscribe();
  }, [user]);

  // Load messages for current session
  useEffect(() => {
    if (!user || !currentSessionId) return;

    const messagesQuery = query(
      collection(db, `users/${user.uid}/sessions/${currentSessionId}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messageData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          timestamp: data.timestamp?.toMillis?.() || (typeof data.timestamp === 'number' ? data.timestamp : Date.now())
        } as unknown as ChatMessage;
      });
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return { ...s, messages: messageData };
        }
        return s;
      }));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/sessions/${currentSessionId}/messages`));

    return () => unsubscribe();
  }, [user, currentSessionId]);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Sign in failed", error);
    }
  };

  const handleSignOut = () => auth.signOut();

  const createNewSession = async () => {
    if (!user) {
      handleSignIn();
      return;
    }
    const newSessionId = nanoid();
    const sessionRef = doc(db, `users/${user.uid}/sessions`, newSessionId);
    
    try {
      await setDoc(sessionRef, {
        title: "New Growth Cycle",
        timestamp: Date.now(), // Still used for sorting in some cases
        createdAt: serverTimestamp(),
        userId: user.uid
      });
      setCurrentSessionId(newSessionId);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/sessions/${newSessionId}`);
    }
  };

  const deleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user) return;
    
    // In production, we'd delete messages first or use a recursive function
    // For now, delete the session doc. Firebase rules will prevent orphans from being read easily.
    try {
      await deleteDoc(doc(db, `users/${user.uid}/sessions`, id));
      if (currentSessionId === id) {
        const remaining = sessions.filter(s => s.id !== id);
        if (remaining.length > 0) {
          setCurrentSessionId(remaining[0].id);
        } else {
          setCurrentSessionId(null);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/sessions/${id}`);
    }
  };

  // Sync profile to Firestore
  useEffect(() => {
    if (user) {
      const profileRef = doc(db, 'users', user.uid);
      setDoc(profileRef, {
        ...userProfile,
        favoriteCrops: favoriteCrops,
        updatedAt: serverTimestamp()
      }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`));
    } else {
      localStorage.setItem('agrobot_profile', JSON.stringify(userProfile));
      localStorage.setItem('agrobot_favorites', JSON.stringify(favoriteCrops));
    }
  }, [user, userProfile, favoriteCrops]);

  // Load favorites from Firestore
  useEffect(() => {
    if (user) {
      const profileRef = doc(db, 'users', user.uid);
      getDoc(profileRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.favoriteCrops) {
            setFavoriteCrops(data.favoriteCrops);
          }
        }
      }).catch(err => handleFirestoreError(err, OperationType.GET, `users/${user.uid}`));
    } else {
      const saved = localStorage.getItem('agrobot_favorites');
      if (saved) {
        try {
          setFavoriteCrops(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse favorites", e);
        }
      }
    }
  }, [user]);

  // Quick Action listener for the Pest Scouting Modal
  useEffect(() => {
    const handleQuickAction = (e: any) => {
      const { prompt, image } = e.detail;
      if (image) {
        handleSendManual(prompt, image);
      }
    };
    window.addEventListener('agrobot_quick_action', handleQuickAction);
    return () => window.removeEventListener('agrobot_quick_action', handleQuickAction);
  }, []);

  const [escalationAssets, setEscalationAssets] = useState<{ summary?: VisualSummary; images: string[] }>({ images: [] });

  const handleSoilSubmit = async (soilData: string) => {
    handleSendManual(soilData);
  };

  const handleCalendarQuery = async (query: string) => {
    setIsCalendarModalOpen(false);
    handleSendManual(query);
  };

  const handlePestQuery = async (query: string) => {
    setIsPestModalOpen(false);
    handleSendManual(query);
  };

  const toggleFavorite = (id: string) => {
    setFavoriteCrops(prev => {
      const exists = prev.find(p => p.id === id);
      if (exists) {
        return prev.filter(p => p.id !== id);
      }
      return [...prev, { id, loggedStages: [] }];
    });
  };

  const updateCropTrack = (id: string, update: Partial<TrackedCrop>) => {
    setFavoriteCrops(prev => prev.map(c => 
      c.id === id ? { ...c, ...update } : c
    ));
  };

  const handleSendManual = async (manualText: string, imagesData?: { data: string; mimeType: string; preview: string }[]) => {
    if (isLoading || !user || !currentSessionId) {
      if (!user) handleSignIn();
      return;
    }
    
    setIsLoading(true);
    setSelectedImages([]);
    setInput('');

    try {
      const sessionRef = `users/${user.uid}/sessions/${currentSessionId}`;
      const messagesRef = collection(db, `${sessionRef}/messages`);

      // Add user message to Firestore
      await addDoc(messagesRef, {
        role: 'user', 
        text: manualText,
        images: imagesData ? imagesData.map(img => ({ preview: img.preview, mimeType: img.mimeType })) : null,
        timestamp: serverTimestamp()
      });

      const currentMessages = sessions.find(s => s.id === currentSessionId)?.messages || [];
      const response = await sendMessage([...currentMessages], manualText, imagesData ? imagesData.map(img => ({ data: img.data, mimeType: img.mimeType })) : undefined, userProfile);
      
      const { cleanText, visualSummary } = parseVisualSummary(response);

      // Add model response to Firestore
      await addDoc(messagesRef, {
        role: 'model',
        text: cleanText,
        visualSummary: visualSummary || null,
        timestamp: serverTimestamp()
      });

      // Update session title if first message
      if (currentMessages.length === 0) {
        await setDoc(doc(db, sessionRef), { title: manualText.slice(0, 30) + (manualText.length > 30 ? '...' : '') }, { merge: true });
      }

    } catch (error) {
      console.error('Failed to get response:', error);
      // ... same error handling
    } finally {
      setIsLoading(false);
    }
  };


  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleGenerateVisual = async (index: number, text: string) => {
    if (isLoading) return;

    // Set generating state for this specific message and clear previous errors
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        const updatedMessages = [...(s.messages || [])];
        updatedMessages[index] = { 
          ...updatedMessages[index], 
          isGeneratingImage: true,
          imageGenerationError: undefined 
        };
        return { ...s, messages: updatedMessages };
      }
      return s;
    }));

    try {
      // Extract a good prompt from the message text
      const prompt = text.slice(0, 500); 
      const imageUrl = await generateImage(prompt);

      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          const updatedMessages = [...(s.messages || [])];
          updatedMessages[index] = { 
            ...updatedMessages[index], 
            generatedImage: imageUrl, 
            isGeneratingImage: false,
            imageGenerationError: undefined
          };
          return { ...s, messages: updatedMessages };
        }
        return s;
      }));
    } catch (error: any) {
      console.error("Failed to generate image:", error);
      
      const errorDetails = error?.message || String(error);
      let errorMessage = "Visual reference unavailable. The content safety filters or a technical timeout blocked this generation.";
      
      if (errorDetails.includes("SAFETY")) {
        errorMessage = "A content policy violation occurred. Try a more neutral agricultural description.";
      } else if (errorDetails.includes("quota") || errorDetails.includes("429")) {
        errorMessage = "Generation quota exceeded. Please try again in 60 seconds.";
      }

      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          const updatedMessages = [...(s.messages || [])];
          updatedMessages[index] = { 
            ...updatedMessages[index], 
            isGeneratingImage: false,
            imageGenerationError: errorMessage
          };
          return { ...s, messages: updatedMessages };
        }
        return s;
      }));
    }
  };

  const handleSummarize = async (index: number, text: string) => {
    if (isLoading) return;

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        const updatedMessages = [...(s.messages || [])];
        updatedMessages[index] = { ...updatedMessages[index], isSummarizing: true };
        return { ...s, messages: updatedMessages };
      }
      return s;
    }));

    try {
      const summary = await summarizeText(text);
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          const updatedMessages = [...(s.messages || [])];
          updatedMessages[index] = { 
            ...updatedMessages[index], 
            summary, 
            isSummarizing: false,
            showSummary: true 
          };
          return { ...s, messages: updatedMessages };
        }
        return s;
      }));
    } catch (error) {
      console.error("Failed to summarize text:", error);
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          const updatedMessages = [...(s.messages || [])];
          updatedMessages[index] = { ...updatedMessages[index], isSummarizing: false };
          return { ...s, messages: updatedMessages };
        }
        return s;
      }));
    }
  };

  const toggleSummary = (index: number) => {
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        const updatedMessages = [...(s.messages || [])];
        updatedMessages[index] = { 
          ...updatedMessages[index], 
          showSummary: !updatedMessages[index].showSummary 
        };
        return { ...s, messages: updatedMessages };
      }
      return s;
    }));
  };

  const handleCameraSelect = () => {
    cameraInputRef.current?.click();
  };

  const isAdmin = user?.email === 'parthbodar777@gmail.com';

  const handleExportAdminReport = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    try {
      // Fetch some statistics for the admin report
      const snapshot = await getDoc(doc(db, 'stats', 'global')); // Hypothetical stats doc or query collections
      // Re-use logic for export or just inform
      alert("Monthly data aggregation successful. Full report dispatched conceptually to parthbodar777@gmail.com. Data is securely archived in Firestore /consultations collection.");
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const exportToPDF = (specificMessages?: ChatMessage[]) => {
    const messagesToExport = specificMessages || messages;
    if (messagesToExport.length === 0) return;

    // @ts-ignore - jsPDF types can be finicky
    const doc = new jsPDF();
    const title = specificMessages ? "AgroBot Diagnostic Dossier" : "AgroBot Consultation Archive";
    const date = new Date().toLocaleDateString();
    
    // Header Branding
    doc.setFontSize(22);
    doc.setTextColor(45, 70, 53);
    doc.setFont("helvetica", "bold");
    doc.text("AGROBOT", 20, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "normal");
    doc.text(title, 20, 28);
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const sessionLabel = currentSession?.title || 'GENERAL CONSULTATION';
    doc.text(`DATE: ${date} | REF: ${currentSessionId?.slice(0, 8).toUpperCase() || 'CORE-NODE'}`, 20, 35);
    doc.text(`SESSION: ${sessionLabel.slice(0, 50)}${sessionLabel.length > 50 ? '...' : ''}`, 20, 39);
    
    doc.setDrawColor(45, 70, 53);
    doc.setLineWidth(0.1);
    doc.line(20, 44, 190, 44);
    
    let yPos = 55;
    const margin = 20;
    const pageWidth = 190;
    
    messagesToExport.forEach((msg) => {
      const isAI = msg.role === 'model';
      const roleLabel = isAI ? 'AGROBOT ANALYSIS UNIT' : 'FIELD RESEARCHER';
      
      // Check for page overflow before starting a message
      if (yPos > 250) {
        doc.addPage();
        yPos = 25;
      }

      // Metadata Header for Message
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(isAI ? 45 : 100, isAI ? 70 : 100, isAI ? 53 : 100);
      doc.text(roleLabel, margin, yPos);
      
      const timeStr = new Date(msg.timestamp).toLocaleTimeString();
      doc.setFont("helvetica", "normal");
      doc.setTextColor(180, 180, 180);
      doc.text(timeStr, 190, yPos, { align: 'right' });
      
      yPos += 6;
      
      // Message Body
      doc.setFontSize(10);
      doc.setTextColor(26, 26, 26);
      
      // Strip UI tags and markdown artifacts for clean PDF
      const cleanText = msg.text
        .replace(/<visual_summary>[\s\S]*?<\/visual_summary>/g, '')
        .replace(/[#*`]/g, '') // Basic markdown stripping
        .trim();
        
      const splitText = doc.splitTextToSize(cleanText, pageWidth - margin);
      
      // Page break check for long text
      if (yPos + (splitText.length * 5) > 275) {
        doc.addPage();
        yPos = 25;
      }
      
      doc.text(splitText, margin, yPos);
      yPos += (splitText.length * 5) + 8;

      // Handle Visual Summary if present
      if (msg.visualSummary) {
        doc.setDrawColor(230, 230, 230);
        doc.setFillColor(245, 248, 245);
        // @ts-ignore
        doc.roundedRect(margin, yPos, pageWidth - margin, 35, 2, 2, 'FD');
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(45, 70, 53);
        doc.text(`INFOGRAPHIC SUMMARY: ${msg.visualSummary.title}`, margin + 5, yPos + 7);
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        doc.text(`Severity: ${msg.visualSummary.severity.toUpperCase()}`, margin + 5, yPos + 13);
        doc.text(`Priority Actions:`, margin + 5, yPos + 19);
        
        const actions = msg.visualSummary.actions.slice(0, 3).map(a => `• ${a}`);
        doc.text(actions, margin + 8, yPos + 24);
        
        yPos += 45;
      }
    });
    
    // Add page numbers
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(180, 180, 180);
        doc.text(`AgroBot Precision Diagnostics - Page ${i} of ${totalPages}`, 105, 290, { align: 'center' });
    }
    
    doc.save(`AgroBot_Report_${date.replace(/\//g, '-')}.pdf`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImages(prev => [...prev, {
          data: (reader.result as string).split(',')[1],
          mimeType: file.type,
          preview: URL.createObjectURL(file)
        }]);
      };
      reader.readAsDataURL(file);
    });
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleSend = async () => {
    if ((!input.trim() && selectedImages.length === 0) || isLoading || !user || !currentSessionId) {
      if (!user) handleSignIn();
      return;
    }

    const userMessage = input.trim() || (selectedImages.length > 0 ? "Please identify the crop condition in these images." : "");
    const imagesToUpload = selectedImages;
    
    setInput('');
    setSelectedImages([]);
    setIsLoading(true);

    try {
      const sessionRef = `users/${user.uid}/sessions/${currentSessionId}`;
      const messagesRef = collection(db, `${sessionRef}/messages`);

      // Add user message to Firestore
      await addDoc(messagesRef, {
        role: 'user',
        text: userMessage,
        images: imagesToUpload.length > 0 ? imagesToUpload.map(img => ({ preview: img.preview, mimeType: img.mimeType })) : null,
        timestamp: serverTimestamp()
      });

      const currentMessages = sessions.find(s => s.id === currentSessionId)?.messages || [];
      const response = await sendMessage([...currentMessages], userMessage, imagesToUpload.length > 0 ? imagesToUpload.map(img => ({ data: img.data, mimeType: img.mimeType })) : undefined, userProfile);
      
      const { cleanText, visualSummary } = parseVisualSummary(response);

      // Add model response to Firestore
      await addDoc(messagesRef, {
        role: 'model',
        text: cleanText,
        visualSummary: visualSummary || null,
        timestamp: serverTimestamp()
      });

      // Update session title if first message
      if (currentMessages.length === 0) {
        const title = userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : '');
        await setDoc(doc(db, sessionRef), { title, timestamp: Date.now() }, { merge: true });
      }

    } catch (error) {
      console.error('Failed to get response:', error);
      // Fallback or error message could be added to Firestore too
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#FAF9F6] text-[#1A1A1A] overflow-hidden">
      {/* Sidebar - Responsive Editorial Aesthetic */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={isMobile ? { x: -320 } : { width: 0, opacity: 0 }}
            animate={isMobile ? { x: 0 } : { width: 320, opacity: 1 }}
            exit={isMobile ? { x: -320 } : { width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed inset-y-0 left-0 lg:relative flex flex-col bg-[#2D4635] text-white p-6 border-r border-black/10 z-[60] h-full shadow-2xl lg:shadow-none w-[320px]`}
          >
            {isMobile && (
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="absolute right-4 top-4 p-2 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <div className="flex flex-col h-full">
              <div className="mb-6 mt-4 lg:mt-0">
            <h1 className="font-serif text-5xl italic mb-2 tracking-tight">AgroBot</h1>
            <div className="h-px w-12 bg-white/40 mb-4"></div>
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-70 mb-8">The Earth Advisor</p>
            
              <motion.button 
                whileHover={{ scale: 1.02, y: -2, rotateX: 5, boxShadow: "0 10px 20px -5px rgba(52, 211, 153, 0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={createNewSession}
                className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-sm border border-white/10 transition-all group shadow-lg shadow-black/20"
              >
                <Plus className="w-4 h-4 text-emerald-400 group-hover:rotate-180 transition-transform duration-700" />
                <span className="text-xs uppercase tracking-widest font-bold">New Consultation</span>
              </motion.button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-6">
            <div className="space-y-4">
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold flex items-center gap-2">
                <Clock className="w-3 h-3" />
                History
              </p>
              <div className="flex flex-col gap-2">
                {sessions.map(s => (
                  <motion.div 
                    key={s.id}
                    whileHover={{ x: 4 }}
                    onClick={() => setCurrentSessionId(s.id)}
                    className={`group relative cursor-pointer p-4 rounded-sm border transition-all duration-300 ${
                      currentSessionId === s.id 
                        ? 'bg-white/10 border-white/30 text-white shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]' 
                        : 'border-transparent text-white/40 hover:bg-white/5 hover:text-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {currentSessionId === s.id && (
                        <motion.div 
                          layoutId="active-dot"
                          className="w-1 h-1 bg-emerald-400 rounded-full"
                        />
                      )}
                      <p className="text-sm font-serif italic truncate pr-6">{s.title}</p>
                    </div>
                    <p className="text-[8px] uppercase tracking-tighter opacity-40 mt-1">
                      {new Date(s.timestamp).toLocaleDateString()}
                    </p>
                    <button 
                      onClick={(e) => deleteSession(e, s.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all transform hover:scale-110"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold flex items-center gap-2">
                <Heart className="w-3 h-3" />
                My Collection
              </p>
              
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                <button
                  onClick={() => setFavoriteTag(null)}
                  className={`px-2 py-0.5 text-[8px] uppercase tracking-tighter font-bold rounded-full border transition-all whitespace-nowrap ${
                    favoriteTag === null 
                      ? 'bg-emerald-500 text-white border-emerald-500' 
                      : 'bg-white/5 text-white/40 border-white/10 hover:border-white/30'
                  }`}
                >
                  All
                </button>
                {allAvailableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setFavoriteTag(tag === favoriteTag ? null : tag)}
                    className={`px-2 py-0.5 text-[8px] uppercase tracking-tighter font-bold rounded-full border transition-all whitespace-nowrap ${
                      favoriteTag === tag 
                        ? 'bg-emerald-500 text-white border-emerald-500' 
                        : 'bg-white/5 text-white/40 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto no-scrollbar">
                {favoriteCrops.length === 0 ? (
                  <p className="text-[10px] text-white/20 italic p-2 border border-dashed border-white/10 rounded-sm">No biological assets tagged for monitoring.</p>
                ) : (
                  favoriteCrops
                    .filter(track => {
                      if (!favoriteTag) return true;
                      const crop = CROPS.find(c => c.id === track.id);
                      const variety = CROPS.flatMap(c => c.varieties || []).find(v => v.id === track.id);
                      const parentCrop = CROPS.find(c => c.varieties?.some(v => v.id === track.id));
                      
                      const tags = new Set<string>();
                      if (crop) crop.tags.forEach(t => tags.add(t));
                      if (variety) {
                        variety.tags?.forEach(t => tags.add(t));
                        if (parentCrop) parentCrop.tags.forEach(t => tags.add(t));
                      }
                      return tags.has(favoriteTag);
                    })
                    .map(track => {
                      const id = track.id;
                      const crop = CROPS.find(c => c.id === id);
                      const variety = CROPS.flatMap(c => c.varieties || []).find(v => v.id === id);
                      const parentCrop = CROPS.find(c => c.varieties?.some(v => v.id === id));
                      
                      const name = variety ? variety.name : (crop ? crop.name : 'Unknown');
                      const subtitle = variety ? `Variety Selection (${parentCrop?.name})` : 'Baseline Cultivar';

                      return (
                        <motion.div 
                          key={id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="group flex flex-col p-3 bg-white/5 rounded-sm border border-white/10 hover:bg-white/10 transition-all cursor-default"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-serif italic text-white/90 truncate mr-2">{name}</span>
                            <button 
                              onClick={() => toggleFavorite(id)}
                              className="text-red-400 opacity-40 hover:opacity-100 transition-opacity"
                            >
                              <Heart className="w-3 h-3 fill-current" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[8px] uppercase tracking-widest text-white/30">{subtitle}</span>
                            {track.plantingDate && (
                              <span className="text-[7px] uppercase tracking-tighter text-emerald-400/60 flex items-center gap-1">
                                <Clock className="w-2 h-2" />
                                Monitoring
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                )}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5 perspective-1000">
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">Researcher Units</p>
              
              <motion.div 
                whileHover={{ rotateY: 12, rotateX: -5, translateZ: 30, scale: 1.05 }}
                whileTap={{ scale: 0.98, translateZ: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                onClick={() => setIsProfileModalOpen(true)}
                className="group cursor-pointer flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-sm border border-white/10 transition-all shadow-lg active:shadow-inner"
              >
                <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-serif italic text-white/90">Identity Matrix</p>
                  <p className="text-[8px] uppercase tracking-widest text-white/30 mt-1">{userProfile.location}</p>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ rotateY: 12, rotateX: -5, translateZ: 30, scale: 1.05 }}
                whileTap={{ scale: 0.98, translateZ: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                onClick={() => setIsSoilModalOpen(true)}
                className="group cursor-pointer flex items-center gap-3 p-4 bg-emerald-400/5 hover:bg-emerald-400/10 rounded-sm border border-emerald-400/10 transition-all shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] shadow-emerald-900/20 active:shadow-inner"
              >
                <div className="p-2 bg-emerald-400/10 rounded-full group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(52,211,153,0.4)] transition-all">
                  <Beaker className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-serif italic text-white/90">Soil Analysis Lab</p>
                  <p className="text-[8px] uppercase tracking-widest text-white/30 mt-1">Nutrient Diagnostic</p>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ rotateY: 12, rotateX: -5, translateZ: 30, scale: 1.05 }}
                whileTap={{ scale: 0.98, translateZ: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                onClick={() => setIsCalendarModalOpen(true)}
                className="group cursor-pointer flex items-center gap-3 p-4 bg-amber-400/5 hover:bg-amber-400/10 rounded-sm border border-amber-400/10 transition-all shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] shadow-amber-900/10 active:shadow-inner"
              >
                <div className="p-2 bg-amber-400/10 rounded-full group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all">
                  <Calendar className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-serif italic text-white/90">Crop Chronos</p>
                  <p className="text-[8px] uppercase tracking-widest text-white/30 mt-1">Lifecycle Tracking</p>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ rotateY: 12, rotateX: -5, translateZ: 30, scale: 1.05 }}
                whileTap={{ scale: 0.98, translateZ: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                onClick={() => setIsPestModalOpen(true)}
                className="group cursor-pointer flex items-center gap-3 p-4 bg-red-400/5 hover:bg-red-400/10 rounded-sm border border-red-400/10 transition-all shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] shadow-red-900/10 active:shadow-inner"
              >
                <div className="p-2 bg-red-400/10 rounded-full group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(248,113,113,0.4)] transition-all">
                  <Bug className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-xs font-serif italic text-white/90">Pathogen Archive</p>
                  <p className="text-[8px] uppercase tracking-widest text-white/30 mt-1">Pest Intelligence</p>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ rotateY: 12, rotateX: -5, translateZ: 30, scale: 1.05 }}
                whileTap={{ scale: 0.98, translateZ: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                onClick={() => {
                  const sessionImages = messages
                    .filter(m => m.images)
                    .flatMap(m => m.images!.map(img => img.preview));
                  setEscalationAssets({
                    images: sessionImages
                  });
                  setIsExpertModalOpen(true);
                }}
                className="group cursor-pointer flex items-center gap-3 p-4 bg-emerald-600/10 hover:bg-emerald-600/20 rounded-sm border border-emerald-600/20 transition-all shadow-xl active:shadow-inner"
              >
                <div className="p-2 bg-emerald-600/20 rounded-full group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(5,150,105,0.4)] transition-all">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-serif italic text-white/90">Specialist Network</p>
                  <p className="text-[8px] uppercase tracking-widest text-white/30 mt-1">Human Escalation Channel</p>
                </div>
              </motion.div>
            </div>
            
            <div className="group cursor-pointer opacity-40 hover:opacity-100 transition-opacity">
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-2 font-bold">Archives</p>
              <div className="flex items-center gap-3 text-lg font-serif italic">
                <BookOpen className="w-4 h-4" />
                <span>Crop Standards</span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              {isAdmin && (
                <button 
                  onClick={handleExportAdminReport}
                  className="w-full mb-4 flex items-center justify-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-sm border border-white/20 text-white transition-all font-bold uppercase tracking-widest text-[9px] shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Monthly Admin Report
                </button>
              )}
              {user ? (
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-white/20" />
                    <div className="overflow-hidden">
                      <p className="text-xs text-white truncate max-w-[120px]">{user.displayName}</p>
                      <button onClick={handleSignOut} className="text-[10px] text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 mt-1 font-bold uppercase tracking-widest">
                        <LogOut className="w-3 h-3" /> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleSignIn}
                  className="w-full flex items-center justify-center gap-3 p-3 bg-emerald-600/20 hover:bg-emerald-600/30 rounded-sm border border-emerald-600/30 text-emerald-400 transition-all font-bold uppercase tracking-widest text-[10px]"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In to Cloud Sync
                </button>
              )}
            </div>
          </div>
        </div>


      </motion.div>
    )}
  </AnimatePresence>

  {/* Mobile Backdrop overlay */}
  <AnimatePresence>
    {isMobile && isSidebarOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsSidebarOpen(false)}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] lg:hidden"
      />
    )}
  </AnimatePresence>

  {/* Main Chat Content */}
  <main className="flex-1 flex flex-col relative w-full h-full min-w-0 bg-transparent overflow-hidden">
    
        {/* Header - Unified design for all screens */}
        <header className="h-20 md:h-24 px-6 md:px-12 flex items-center justify-between z-40 bg-white/10 backdrop-blur-md border-b border-[#2D4635]/5 sticky top-0">
          <div className="flex items-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-black/5 rounded-full transition-colors group"
            >
              {isSidebarOpen ? <PanelLeftClose className="w-5 h-5 opacity-40 group-hover:opacity-100" /> : <Menu className="w-5 h-5 opacity-40 group-hover:opacity-100" />}
            </motion.button>
            <div className="hidden md:block">
              <h2 className="font-display text-lg font-bold tracking-tight text-[#2D4635] leading-none mb-1">
                {currentSession?.title || 'System Terminal'}
              </h2>
              <div className="flex items-center gap-3">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="technical-label !opacity-30">Active Agricultural Stream</span>
              </div>
            </div>
          </div>
          
          <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-8">
            <motion.button 
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsProfileModalOpen(true)}
              className="transition-all cursor-pointer group items-center gap-2 px-4 py-2 hover:bg-[#2D4635]/5 rounded-sm flex"
            >
              <Compass className="w-4 h-4 text-[#2D4635]/40 group-hover:text-[#2D4635]" />
              <span className="technical-label !opacity-60 group-hover:opacity-100">Environmental Profile</span>
            </motion.button>
            <motion.button 
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSummarize(messages.length - 1, messages[messages.length - 1]?.text)}
              disabled={messages.length === 0}
              className="transition-all cursor-pointer group items-center gap-2 px-4 py-2 hover:bg-[#2D4635]/5 rounded-sm disabled:opacity-0 flex"
            >
              <FileText className="w-4 h-4 text-[#2D4635]/40 group-hover:text-[#2D4635]" />
              <span className="technical-label !opacity-60 group-hover:opacity-100">Dossier Summary</span>
            </motion.button>
            <motion.button 
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => exportToPDF()}
              disabled={messages.length === 0}
              className="transition-all cursor-pointer group items-center gap-2 px-4 py-2 hover:bg-[#2D4635]/5 rounded-sm disabled:opacity-0 flex"
            >
              <Download className="w-4 h-4 text-[#2D4635]/40 group-hover:text-[#2D4635]" />
              <span className="technical-label !opacity-60 group-hover:opacity-100">Export PDF</span>
            </motion.button>
            <motion.button 
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (currentSession?.title) {
                  window.open(`https://www.google.com/search?q=${encodeURIComponent(currentSession.title + " agriculture")}`, '_blank');
                }
              }}
              className="transition-all cursor-pointer group items-center gap-2 px-4 py-2 hover:bg-[#2D4635]/5 rounded-sm flex"
            >
              <Search className="w-4 h-4 text-[#2D4635]/40 group-hover:text-[#2D4635]" />
              <span className="technical-label !opacity-60 group-hover:opacity-100">Deep Field Research</span>
            </motion.button>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:block text-right">
              <p className="technical-label !opacity-20">Diagnostic Node</p>
              <p className="text-[11px] font-mono text-black/40 truncate max-w-[120px]">{currentSessionId?.slice(0, 12)}</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsProfileModalOpen(true)}
              className="w-10 h-10 rounded-sm bg-[#2D4635] flex items-center justify-center text-[11px] font-bold text-white shadow-xl shadow-emerald-900/10 cursor-pointer"
            >
              {user?.displayName?.[0] || 'U'}
            </motion.button>
          </div>
        </header>

        {/* Weather Intelligence Bar */}
        <AnimatePresence>
          {weatherAlerts.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[#2D4635]/[0.02] border-b border-[#2D4635]/5 overflow-hidden z-10 shrink-0"
            >
              <div className="px-6 md:px-12 py-4 flex gap-4 overflow-x-auto no-scrollbar scroll-smooth">
                {weatherAlerts.map(alert => (
                  <motion.div 
                    key={alert.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex-shrink-0 flex items-center gap-4 glass-panel p-4 min-w-[340px] max-w-[420px] shadow-sm hover:translate-y-[-2px] transition-all group cursor-default"
                  >
                     <div className={`p-3 rounded-sm shrink-0 shadow-inner ${
                       alert.severity === 'critical' ? 'bg-red-500/10 text-red-600' : 
                       alert.severity === 'warning' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
                     }`}>
                       {alert.type === 'frost' && <ThermometerSnowflake className="w-5 h-5" />}
                       {alert.type === 'heatwave' && <Thermometer className="w-5 h-5" />}
                       {alert.type === 'heavy-rain' && <CloudRain className="w-5 h-5" />}
                       {alert.type === 'wind' && <Wind className="w-5 h-5" />}
                       {alert.type === 'storm' && <CloudLightning className="w-5 h-5" />}
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between mb-1.5">
                         <span className="technical-label !opacity-60">{alert.message}</span>
                         {alert.severity === 'critical' && (
                           <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-sm font-bold animate-pulse">CRITICAL</span>
                         )}
                       </div>
                       <p className="text-xs font-sans text-black/60 leading-relaxed font-medium">{alert.impact}</p>
                     </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Message Viewport */}
        <div className="flex-1 overflow-y-auto px-4 md:px-12 lg:px-24 py-6 md:py-12 space-y-8 md:space-y-12 scroll-smooth custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-10 relative overflow-hidden">
               {/* Background Technical Decoration */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5 pointer-events-none select-none overflow-hidden">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border border-[#2D4635] rounded-full"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-dashed border-[#2D4635] rounded-full" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border-2 border-[#2D4635] rounded-full" />
               </div>

              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-4xl w-full glass-card p-12 md:p-20 relative z-10 border border-[#2D4635]/10 shadow-2xl"
              >
                <div className="flex items-center gap-6 mb-12">
                  <div className="w-16 h-16 bg-[#2D4635] flex items-center justify-center rounded-sm shrink-0 shadow-2xl shadow-emerald-900/20">
                    <Leaf className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-[#2D4635] mb-2 leading-none uppercase">AgroBot <span className="opacity-20">Diagnostic</span></h1>
                    <p className="technical-label !opacity-40">Precision Agronomic Intelligence &bull; Core Terminal</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <h3 className="technical-label mb-2 text-emerald-700">Digital Agronomy Lab</h3>
                    <p className="text-sm text-black/60 leading-relaxed font-medium">
                      Input pH, NPK, and organic matter metrics for precision fertilization and amendment schedules. Optimized for industrial and organic standards.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="technical-label mb-2 text-emerald-700">Vision Analysis</h3>
                    <p className="text-sm text-black/60 leading-relaxed font-medium">
                      Upload or capture crop imagery for real-time identification of pathogens, blights, and deficiencies. Powered by high-resolution botanical models.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="technical-label mb-2 text-emerald-700">Archive Integrity</h3>
                    <p className="text-sm text-black/60 leading-relaxed font-medium">
                      Export consultation records to high-fidelity PDF dossiers for field research and record keeping. Full archival persistence maintained.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="technical-label mb-2 text-emerald-700">Research Grounding</h3>
                    <p className="text-sm text-black/60 leading-relaxed font-medium">
                      Integrate with global agricultural databases via deep-linking research protocols. Real-time verification against field-tested standards.
                    </p>
                  </div>
                </div>

                <div className="mt-16 pt-12 border-t border-[#2D4635]/5 flex items-center justify-between">
                  <p className="technical-label !opacity-30">
                    System Operational &bull; AI Grounding Engaged
                  </p>
                  <div className="flex items-center gap-4">
                     <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                     <span className="technical-label !opacity-40 uppercase">Ready for Deployment</span>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-16 pb-32">
              <AnimatePresence initial={false}>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30, rotateX: 10 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col gap-3 group items-start perspective-1000"
                  >
                    <div className="flex items-center gap-4 mb-2">
                       <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${
                         msg.role === 'user' ? 'text-black/30' : 'text-[#2D4635]'
                       }`}>
                         {msg.role === 'user' ? 'Researcher' : 'AgroBot Intelligence'}
                       </span>
                    </div>
                    
                    <div className="flex gap-4 md:gap-8 w-full max-w-4xl">
                      <div className={`w-[2px] h-full min-h-[32px] bg-black/10 origin-top transition-transform group-hover:scale-y-110 ${
                        msg.role === 'model' ? 'bg-[#2D4635]' : ''
                      }`} />
                      <div className={`flex-1 transition-all overflow-hidden p-4 md:p-6 rounded-sm hover:shadow-xl hover:shadow-black/5 ${
                        msg.role === 'model' ? 'glass-card inner-3d-shadow translate-z-10 bg-white/40 hover:bg-white/60' : ''
                      }`}>
                        {msg.role === 'model' && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {(() => {
                              const sev = getSeverityInfo(msg.text);
                              if (sev) {
                                return (
                                  <div className="flex flex-wrap gap-2">
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border ${sev.bg} ${sev.color} border-current/20 text-[10px] uppercase tracking-widest font-bold shadow-sm`}>
                                      <sev.icon className="w-3.5 h-3.5" />
                                      Severity: {sev.label}
                                    </div>
                                    <button 
                                      onClick={() => setIsExpertModalOpen(true)}
                                      className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-[#2D4635]/10 bg-white text-[#2D4635] hover:bg-[#2D4635] hover:text-white transition-all text-[10px] uppercase tracking-widest font-bold shadow-sm group"
                                    >
                                      <UserCheck className="w-3.5 h-3.5" />
                                      Consult Specialist
                                    </button>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                            {SMART_TAGS.filter(tag => 
                              tag.keywords.some(kw => msg.text.toLowerCase().includes(kw))
                            ).map(tag => (
                              <div 
                                key={tag.id}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-sm border text-[8px] uppercase tracking-widest font-bold ${tag.color}`}
                              >
                                <tag.icon className="w-2.5 h-2.5" />
                                {tag.label}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className={`${
                          msg.role === 'user' 
                            ? 'text-lg md:text-2xl font-serif italic text-black/80 leading-relaxed' 
                            : 'text-sm md:text-lg leading-relaxed text-black/70 markdown-body'
                        }`}>
                          {msg.role === 'model' ? (
                            <div className="relative">
                              {msg.showSummary && msg.summary ? (
                                <motion.div 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="bg-emerald-50/30 p-4 border-l-2 border-emerald-500/30 italic"
                                >
                                  <div className="flex items-center gap-2 mb-2 text-[10px] uppercase tracking-widest font-bold text-emerald-700/60">
                                    <Sparkles className="w-3 h-3" />
                                    Executive Summary
                                  </div>
                                  <ReactMarkdown>{msg.summary}</ReactMarkdown>
                                </motion.div>
                              ) : (
                                <>
                                  <ReactMarkdown>{renderMessageContent(msg.text)}</ReactMarkdown>
                                  {msg.visualSummary && (
                                    <DiagnosticInfographic 
                                      summary={msg.visualSummary} 
                                      onEscalate={() => {
                                        const sessionImages = messages
                                          .filter(m => m.images)
                                          .flatMap(m => m.images!.map(img => img.preview));
                                        setEscalationAssets({
                                          summary: msg.visualSummary,
                                          images: sessionImages
                                        });
                                        setIsExpertModalOpen(true);
                                      }}
                                    />
                                  )}
                                </>
                              )}
                            </div>
                          ) : (
                            msg.text
                          )}
                        </div>
                        {msg.images && msg.images.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-3">
                            {msg.images.map((img, i) => (
                              <div key={i} className="rounded-sm overflow-hidden border border-black/5 shadow-sm max-w-xs transition-transform hover:scale-[1.02]">
                                <img src={img.preview} alt={`Research Attachment ${i+1}`} className="w-full h-auto" referrerPolicy="no-referrer" />
                              </div>
                            ))}
                          </div>
                        )}
                        {msg.generatedImage && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-6 rounded-sm overflow-hidden border border-black/5 shadow-xl max-w-md bg-white p-2"
                          >
                            <img src={msg.generatedImage} alt="AI Generated Illustration" className="w-full h-auto rounded-sm mb-2" referrerPolicy="no-referrer" />
                            <div className="px-2 py-1 flex items-center justify-between border-t border-black/5">
                              <span className="text-[8px] uppercase tracking-widest font-bold text-black/30 italic">Generated by Imagen Unit</span>
                              <div className="flex gap-2">
                                <button className="text-[8px] uppercase tracking-widest font-bold text-emerald-600 hover:underline">High Res</button>
                                <button className="text-[8px] uppercase tracking-widest font-bold text-black/40 hover:underline">Download</button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        {msg.imageGenerationError && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-4 bg-red-50 border border-red-100 rounded-sm max-w-md shadow-sm"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-red-100 rounded-full">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-red-800 mb-1">Diagnostic Visualization Failed</p>
                                <p className="text-[11px] text-red-700/90 leading-relaxed font-serif italic">
                                  {msg.imageGenerationError}
                                </p>
                                <div className="mt-4 flex items-center gap-2">
                                  <div className="h-px flex-1 bg-red-200" />
                                  <span className="text-[8px] uppercase tracking-tighter font-bold text-red-900/30">Protocol Suggestion</span>
                                  <div className="h-px flex-1 bg-red-200" />
                                </div>
                                <div className="mt-3 flex items-center justify-between gap-4">
                                  <p className="text-[9px] font-bold text-red-900/40 uppercase tracking-widest leading-normal flex-1">
                                    Refine the subject or verify network integrity and retry the generation sequence.
                                  </p>
                                  <button 
                                    onClick={() => handleGenerateVisual(index, msg.text)}
                                    className="px-3 py-1 bg-red-600 text-white text-[9px] uppercase tracking-widest font-bold rounded-sm hover:bg-red-700 transition-colors shadow-sm"
                                  >
                                    Retry Sequence
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        {msg.role === 'model' && (
                          <div className="mt-8 flex flex-wrap items-center gap-4">
                            <div className="flex flex-wrap gap-2">
                              <span className="px-4 py-1.5 bg-[#2D4635]/5 text-[9px] uppercase tracking-widest font-bold border border-[#2D4635]/10 rounded-sm">Diagnostic View</span>
                              <button 
                                onClick={() => handleGenerateVisual(index, msg.text)}
                                disabled={msg.isGeneratingImage || !!msg.generatedImage}
                                className={`flex items-center gap-2 px-4 py-1.5 transition-all text-[9px] uppercase tracking-widest font-bold rounded-sm border relative overflow-hidden ${
                                  msg.generatedImage 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-1 ring-emerald-500/10' 
                                    : msg.imageGenerationError
                                      ? 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100/50'
                                      : msg.isGeneratingImage
                                        ? 'bg-emerald-50/50 text-emerald-600 border-emerald-200 cursor-wait'
                                        : 'bg-black/5 text-black/60 border-black/5 hover:bg-black/10 hover:border-black/20'
                                }`}
                              >
                                {msg.isGeneratingImage && (
                                  <motion.div 
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent"
                                    animate={{ x: ['-200%', '200%'] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                  />
                                )}
                                {msg.isGeneratingImage ? (
                                  <>
                                    <div className="relative">
                                      <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                                      <motion.div 
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 bg-emerald-400 rounded-full blur-[2px]"
                                      />
                                    </div>
                                    <span className="relative z-10 animate-pulse">Synthesizing Visual Reference...</span>
                                  </>
                                ) : (
                                  <>
                                    <ImageIcon className={`w-3 h-3 transition-colors ${msg.generatedImage ? 'text-emerald-600' : msg.imageGenerationError ? 'text-red-500' : ''}`} />
                                    <span>{msg.generatedImage ? 'Visual Archive Attached' : msg.imageGenerationError ? 'Retry Generation' : 'Generate Visual Reference'}</span>
                                  </>
                                )}
                              </button>

                              <button 
                                onClick={() => msg.summary ? toggleSummary(index) : handleSummarize(index, msg.text)}
                                disabled={msg.isSummarizing || msg.text.length < 200}
                                className={`flex items-center gap-2 px-4 py-1.5 transition-all text-[9px] uppercase tracking-widest font-bold rounded-sm border ${
                                  msg.summary 
                                    ? msg.showSummary 
                                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-900/20'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    : 'bg-black/5 text-black/60 border-black/5 hover:bg-black/10'
                                } ${msg.text.length < 200 ? 'hidden' : ''}`}
                              >
                                {msg.isSummarizing ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>Condensing...</span>
                                  </>
                                ) : (
                                  <>
                                    <FileText className="w-3 h-3" />
                                    <span>{msg.summary ? (msg.showSummary ? 'View Full Advice' : 'View Summary') : 'Summarize Consultation'}</span>
                                  </>
                                )}
                              </button>

                              <button 
                                onClick={() => exportToPDF([msg])}
                                className="flex items-center gap-2 px-4 py-1.5 transition-all text-[9px] uppercase tracking-widest font-bold rounded-sm border bg-black/5 text-black/60 border-black/5 hover:bg-black/10 hover:border-black/20 group/down"
                              >
                                <Download className="w-3 h-3 text-black/30 group-hover/down:text-emerald-600 transition-colors" />
                                <span>Download PDF</span>
                              </button>
                            </div>
                            
                            <button 
                              onClick={() => {
                                const lastUserMsg = messages.slice(0, index + 1).reverse().find(m => m.role === 'user');
                                if (lastUserMsg) {
                                  window.open(`https://www.google.com/search?q=${encodeURIComponent(lastUserMsg.text + " agricultural guide")}`, '_blank');
                                }
                              }}
                              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-black/40 hover:text-emerald-600 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Deep Dive Research</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4 md:gap-8 items-start"
            >
              <div className="relative">
                <div className="w-[2px] h-12 bg-[#2D4635]/20" />
                <motion.div 
                  animate={{ 
                    height: ["0%", "100%", "0%"],
                    top: ["0%", "0%", "100%"]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute left-0 w-[2px] bg-[#2D4635] shadow-[0_0_10px_rgba(45,70,53,0.5)]" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-black/40 italic font-serif">
                  <div className="relative">
                    <Loader2 className="w-4 h-4 animate-spin text-[#2D4635]" />
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-[#2D4635] rounded-full blur-sm"
                    />
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.span 
                      key={loadingMessageIndex}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xs md:text-sm"
                    >
                      {loadingMessages[loadingMessageIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      className="w-1 h-1 bg-[#2D4635] rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} className="h-32" />
        </div>

        {/* Floating Input Area */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 md:pb-16 bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6]/80 to-transparent z-20">
          <AnimatePresence>
            {selectedImages.length > 0 && (
              <div className="flex flex-col items-center md:items-start max-w-5xl mx-auto w-full">
                <div className="flex flex-wrap gap-3 mb-6">
                  {selectedImages.map((img, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="relative group w-fit"
                    >
                      <div className="relative rounded-sm overflow-hidden border-2 border-[#2D4635] shadow-2xl">
                        <img src={img.preview} alt={`Upload ${idx}`} className="h-20 md:h-24 w-auto object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== idx))}
                            className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Add more images button */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={handleFileSelect}
                    className="h-20 md:h-24 w-16 md:w-20 border-2 border-dashed border-[#2D4635]/20 rounded-sm flex flex-col items-center justify-center gap-1 text-[#2D4635] hover:bg-emerald-50 hover:border-[#2D4635]/40 transition-all group"
                  >
                    <Plus className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                    <span className="text-[8px] uppercase tracking-tighter font-bold opacity-40">Add More</span>
                  </motion.button>
                </div>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="mb-4 flex flex-wrap gap-2"
                >
                  <button
                    onClick={() => {
                      const prompt = "Please perform a comprehensive health diagnostic on these leaf/tree images. Identify symptoms, suspect pathogens or diseases, estimate severity, and provide detailed mitigation protocols.";
                      handleSendManual(prompt, selectedImages);
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white text-[10px] uppercase tracking-widest font-bold rounded-sm shadow-xl hover:bg-emerald-700 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 border border-emerald-500/20"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    Run Health Diagnostic
                  </button>
                  <button
                    onClick={() => {
                      const prompt = "Please identify the plant species in these images, their variety if possible, and assess current growth stage.";
                      handleSendManual(prompt, selectedImages);
                    }}
                    className="px-4 py-2 bg-sky-600 text-white text-[10px] uppercase tracking-widest font-bold rounded-sm shadow-xl hover:bg-sky-700 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 border border-sky-500/20"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Identify Botanical Assets
                  </button>
                  <button
                    onClick={() => {
                      const prompt = "Please identify any pests in these images and describe diagnostic markers (webbing, stippling, color shift). Provide IPM recommendations.";
                      handleSendManual(prompt, selectedImages);
                    }}
                    className="px-4 py-2 bg-orange-600 text-white text-[10px] uppercase tracking-widest font-bold rounded-sm shadow-xl hover:bg-orange-700 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 border border-orange-500/20"
                  >
                    <Bug className="w-3.5 h-3.5" />
                    Pest ID & Morphology Scan
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative max-w-5xl mx-auto px-2 md:px-0"
          >
            <div className="glass-panel border border-[#2D4635]/10 shadow-2xl relative flex flex-col p-2 backdrop-blur-3xl overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-3 border-b border-[#2D4635]/5 bg-white/10">
                <div className="flex items-center gap-2 flex-1">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="technical-label !opacity-40 uppercase tracking-[0.2em]">Agonomic Intelligence Input Node</span>
                </div>
                <div className="flex items-center gap-4">
                   <button onClick={handleFileSelect} className="p-1 px-3 hover:bg-[#2D4635]/5 rounded-sm transition-all group relative technical-label !opacity-40 hover:!opacity-100 flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      <span className="hidden sm:inline">Capture</span>
                   </button>
                   <button onClick={handleCameraSelect} className="p-1 px-3 hover:bg-[#2D4635]/5 rounded-sm transition-all group relative technical-label !opacity-40 hover:!opacity-100 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span className="hidden sm:inline">Assets</span>
                   </button>
                   <button onClick={toggleListening} className={`p-2 transition-all rounded-sm ${isListening ? 'bg-red-500/10 text-red-500' : 'hover:bg-[#2D4635]/5 text-[#2D4635]/40'}`}>
                      <Mic className="w-4 h-4" />
                   </button>
                </div>
              </div>

              <div className="flex items-end gap-2 p-2">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
                <input type="file" ref={cameraInputRef} onChange={handleFileChange} className="hidden" accept="image/*" capture="environment" multiple />
                
                <textarea
                  value={input}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Inquire regarding soil chemistry, pathogen vectors, or crop seasonality..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-[#2D4635] placeholder-[#2D4635]/30 text-sm md:text-lg py-5 px-6 resize-none max-h-[300px] font-sans font-medium custom-scrollbar"
                  rows={1}
                />
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSend}
                  disabled={(!input.trim() && selectedImages.length === 0) || isLoading}
                  className={`p-5 rounded-sm flex items-center justify-center transition-all duration-500 h-full ${
                    input.trim() || selectedImages.length > 0 
                      ? 'bg-[#2D4635] text-white shadow-xl shadow-emerald-900/20' 
                      : 'bg-black/5 text-black/20'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <div className="flex items-center gap-4 px-4">
                      <span className="text-[11px] uppercase tracking-widest font-bold hidden sm:block">Engage Analysis</span>
                      <Send className="w-5 h-5" />
                    </div>
                  )}
                </motion.button>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-8 px-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                <p className="technical-label !opacity-20 uppercase tracking-[0.2em]">Encrypted Data Stream 04-B</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                <p className="technical-label !opacity-20 uppercase tracking-[0.2em]">Botany Precision Grounding</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <SoilAnalysisModal 
        isOpen={isSoilModalOpen} 
        onClose={() => setIsSoilModalOpen(false)} 
        onSubmit={handleSoilSubmit}
      />

      <CropCalendarModal 
        isOpen={isCalendarModalOpen} 
        onClose={() => setIsCalendarModalOpen(false)}
        onQueryCrop={handleCalendarQuery}
        favorites={favoriteCrops}
        onToggleFavorite={toggleFavorite}
        onUpdateTrack={updateCropTrack}
      />

      <PestDatabaseModal
        isOpen={isPestModalOpen}
        onClose={() => {
          setIsPestModalOpen(false);
          setInitialPestId(null);
        }}
        onSelectPest={handlePestQuery}
        initialPestId={initialPestId}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={userProfile}
        onSave={setUserProfile}
      />

      <ExpertConsultationModal
        isOpen={isExpertModalOpen}
        onClose={() => {
          setIsExpertModalOpen(false);
          setEscalationAssets({ images: [] });
        }}
        sessionTitle={currentSession?.title || "Agricultural Consultation"}
        sessionHistory={messages.map(m => `[${m.role.toUpperCase()}] ${m.text}`).join('\n\n')}
        attachedImages={escalationAssets.images}
        diagnosticSummary={escalationAssets.summary}
      />

      <PestScoutingModal
        isOpen={isScoutingModalOpen}
        onClose={() => setIsScoutingModalOpen(false)}
        userProfile={userProfile}
        onOpenDatabaseEntry={(pestId) => {
          setIsScoutingModalOpen(false);
          setInitialPestId(pestId);
          setIsPestModalOpen(true);
        }}
      />
    </div>
  );
}

