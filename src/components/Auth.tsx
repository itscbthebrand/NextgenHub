import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Zap, ShieldCheck, Cpu } from 'lucide-react';
import { storage, getFingerprint, User } from '../lib/storage';

interface AuthProps {
  onSuccess: (user: User) => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
      const fingerprint = getFingerprint();
      const users = storage.getUsers();
      let user = users.find(u => u.fingerprint === fingerprint);

      if (!user) {
        // Create new user based on device data
        const uid = Math.random().toString(36).substring(2, 10);
        user = {
          uid,
          fingerprint,
          displayName: `User_${fingerprint.substring(0, 4)}`,
          balance: 100, // Welcome bonus
          referralCount: 0,
          referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          createdAt: new Date().toISOString()
        };
        users.push(user);
        storage.saveUsers(users);

        // Handle Referral Tracking (simulated)
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        if (refCode) {
          const referrer = users.find(u => u.referralCode === refCode);
          if (referrer) {
            storage.addReferral({
              referrerUid: referrer.uid,
              referredEmail: `${user.displayName}@nextgen.io`,
              status: 'pending',
              createdAt: new Date().toISOString()
            });
          }
        }
      }

      storage.setCurrentUser(user.uid);
      onSuccess(user);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-500/20 blur-[120px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md p-8 mx-4 bg-black/40 border border-white/10 rounded-[2rem] backdrop-blur-2xl shadow-2xl"
      >
        <div className="text-center mb-10">
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-cyan-500 to-fuchsia-600 shadow-[0_0_40px_rgba(6,182,212,0.4)]"
          >
            <Zap size={40} className="text-white fill-white" />
          </motion.div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2 uppercase italic">
            NextGen<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">Referral</span>
          </h1>
          <p className="text-gray-400 font-medium">Get <span className="text-cyan-400">100 TK</span> instantly upon joining.</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="group relative w-full py-4 bg-white text-black font-bold rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-white transition-colors">
              {loading ? "SCANNING DEVICE..." : (
                <>
                  <Cpu size={20} />
                  INITIALIZE BIOMETRIC LOGIN
                </>
              )}
            </span>
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 uppercase tracking-widest font-bold">
            <ShieldCheck size={14} />
            Device Fingerprint: {getFingerprint().substring(0, 8)}...
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-mono">
            IP & DEVICE AUTHENTICATION ACTIVE
          </p>
        </div>
      </motion.div>
    </div>
  );
}
