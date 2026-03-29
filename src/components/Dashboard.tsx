import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  Users, 
  Share2, 
  ArrowUpRight, 
  LogOut, 
  Copy, 
  CheckCircle2, 
  Gamepad2,
  DollarSign,
  Clock,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { storage, User, Referral } from '../lib/storage';
import TicTacToe from './TicTacToe';
import Withdrawal from './Withdrawal';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user: initialUser }: DashboardProps) {
  const [user, setUser] = useState(initialUser);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [showGame, setShowGame] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pendingReferral, setPendingReferral] = useState<Referral | null>(null);

  useEffect(() => {
    const refreshData = () => {
      const currentUser = storage.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const allRefs = storage.getReferrals();
        setReferrals(allRefs.filter(r => r.referrerUid === currentUser.uid));
      }
    };

    refreshData();
    // In a real app we'd use a more robust state management or event system
    const interval = setInterval(refreshData, 2000);
    return () => clearInterval(interval);
  }, []);

  const copyReferral = () => {
    const link = `${window.location.origin}?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inviteFriends = async () => {
    const link = `${window.location.origin}?ref=${user.referralCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NextGen Refer & Earn',
          text: 'Join me on NextGen and get 100 TK instantly!',
          url: link,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      copyReferral();
    }
  };

  const handleClaimReferral = (ref: Referral) => {
    setPendingReferral(ref);
    setShowGame(true);
  };

  const onGameWin = () => {
    if (!pendingReferral) return;
    const bonus = 50;
    const newBalance = user.balance + bonus;
    
    storage.updateUser(user.uid, {
      balance: newBalance,
      referralCount: user.referralCount + 1
    });
    
    storage.updateReferral(pendingReferral.id, 'claimed');

    setShowGame(false);
    setPendingReferral(null);
  };

  const onGameLose = () => {
    if (!pendingReferral) return;
    const penalty = 20;
    const newBalance = Math.max(0, user.balance - penalty);
    
    storage.updateUser(user.uid, {
      balance: newBalance
    });
    
    storage.updateReferral(pendingReferral.id, 'failed');

    setShowGame(false);
    setPendingReferral(null);
  };

  const onGameDraw = () => {
    setShowGame(false);
    setPendingReferral(null);
  };

  const generateFakeReferral = () => {
    const fakeEmail = `user_${Math.floor(Math.random() * 10000)}@nextgen.io`;
    storage.addReferral({
      referrerUid: user.uid,
      referredEmail: fakeEmail,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
  };

  const handleLogout = () => {
    storage.setCurrentUser(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <DollarSign size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic">
            NextGen <span className="text-cyan-400">Hub</span>
          </h1>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
        >
          <LogOut size={14} />
          Disconnect
        </button>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden p-8 rounded-[2.5rem] bg-gradient-to-br from-cyan-900/40 to-black border border-cyan-500/30 shadow-[0_20px_50px_rgba(6,182,212,0.15)]"
          >
            <div className="absolute top-0 right-0 p-6">
              <Wallet className="text-cyan-500/20 w-32 h-32 -mr-8 -mt-8 rotate-12" />
            </div>
            
            <div className="relative z-10">
              <p className="text-cyan-400/60 text-xs font-bold uppercase tracking-[0.3em] mb-2">Available Liquidity</p>
              <h2 className="text-7xl font-black tracking-tighter mb-8">
                {user.balance} <span className="text-3xl text-gray-500">TK</span>
              </h2>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setShowWithdraw(true)}
                  className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-2xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_10px_20px_rgba(6,182,212,0.3)]"
                >
                  WITHDRAW NOW
                  <ArrowUpRight size={20} />
                </button>
                <button 
                  onClick={inviteFriends}
                  className="px-8 py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black rounded-2xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_10px_20px_rgba(192,38,211,0.3)]"
                >
                  INVITE FRIENDS
                  <Share2 size={20} />
                </button>
                <button 
                  onClick={generateFakeReferral}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black rounded-2xl flex items-center gap-2 transition-all"
                >
                  SIMULATE REFERRAL
                  <Users size={20} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Referral Link Section */}
          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Share2 size={20} className="text-fuchsia-500" />
              Your Referral Protocol
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 font-mono text-sm text-gray-400 flex items-center overflow-hidden">
                {window.location.origin}?ref={user.referralCode}
              </div>
              <button 
                onClick={copyReferral}
                className="px-6 py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all shrink-0"
              >
                {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                {copied ? "COPIED" : "COPY LINK"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats & Activity */}
        <div className="space-y-8">
          <div className="p-8 rounded-[2rem] bg-fuchsia-900/10 border border-fuchsia-500/20">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs">Network Stats</h3>
              <Users size={16} className="text-fuchsia-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                <p className="text-2xl font-black">{user.referralCount}</p>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Successful</p>
              </div>
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                <p className="text-2xl font-black">{referrals.filter(r => r.status === 'pending').length}</p>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Pending</p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 flex-1 flex flex-col">
            <h3 className="font-bold mb-6 flex items-center gap-2 text-sm uppercase tracking-widest text-gray-400">
              Referral Activity
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar flex-1">
              {referrals.length === 0 ? (
                <div className="text-center py-8 text-gray-600 italic text-sm">
                  No referral activity detected.
                </div>
              ) : (
                referrals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((ref) => (
                  <div key={ref.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{ref.referredEmail}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {ref.status === 'pending' && (
                          <span className="flex items-center gap-1 text-[10px] text-yellow-500 font-bold uppercase">
                            <Clock size={10} /> Pending
                          </span>
                        )}
                        {ref.status === 'claimed' && (
                          <span className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase">
                            <ShieldCheck size={10} /> Claimed
                          </span>
                        )}
                        {ref.status === 'failed' && (
                          <span className="flex items-center gap-1 text-[10px] text-red-500 font-bold uppercase">
                            <AlertCircle size={10} /> Failed
                          </span>
                        )}
                      </div>
                    </div>
                    {ref.status === 'pending' && (
                      <button 
                        onClick={() => handleClaimReferral(ref)}
                        className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500 hover:text-black transition-all"
                        title="Claim Bonus"
                      >
                        <Gamepad2 size={18} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Game Modal */}
      <AnimatePresence>
        {showGame && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <TicTacToe 
                balance={user.balance}
                betAmount={50}
                onWin={onGameWin}
                onLose={onGameLose}
                onDraw={onGameDraw}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {showWithdraw && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <Withdrawal 
              balance={user.balance} 
              onClose={() => setShowWithdraw(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
