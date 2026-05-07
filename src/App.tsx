/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import ChatInterface from './components/ChatInterface';
import { AuthPage } from './components/AuthPage';
import { auth, onAuthStateChanged, User } from './services/firebase';
import { Loader2, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FDFCF9]">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 bg-[#2D4635] rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-900/20"
        >
          <Leaf className="w-8 h-8 text-white" />
        </motion.div>
        <Loader2 className="w-6 h-6 text-[#2D4635] animate-spin opacity-20" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">
      <AnimatePresence mode="wait">
        {user ? (
          <ChatInterface key="chat" />
        ) : (
          <AuthPage key="auth" onSuccess={() => {}} />
        )}
      </AnimatePresence>
    </div>
  );
}
