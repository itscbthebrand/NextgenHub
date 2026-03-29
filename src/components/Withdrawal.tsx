import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, CreditCard, Send, AlertCircle } from 'lucide-react';

interface WithdrawalProps {
  balance: number;
  onClose: () => void;
}

export default function Withdrawal({ balance, onClose }: WithdrawalProps) {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState(balance.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canWithdraw = balance >= 500;

  const [step, setStep] = useState<'input' | 'confirm'>('input');

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWithdraw) {
      setError("Minimum withdrawal limit is 500 TK. Keep referring!");
      return;
    }
    setStep('confirm');
  };

  const confirmWithdraw = () => {
    setLoading(true);
    // Simulate processing
    setTimeout(() => {
      setLoading(false);
      setError("SYSTEM OVERLOAD: Transaction failed. Security protocol triggered. Please try again after 24 hours.");
      setStep('input');
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl"
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all z-20"
      >
        <X size={20} />
      </button>

      <AnimatePresence mode="wait">
        {step === 'input' ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="mb-8">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-4">
                <CreditCard className="text-cyan-400" size={32} />
              </div>
              <h2 className="text-3xl font-black tracking-tighter uppercase italic">
                Withdrawal <span className="text-cyan-400">Portal</span>
              </h2>
              <p className="text-gray-500 text-sm font-medium mt-1">Transfer your earnings to PayPal.</p>
            </div>

            {!canWithdraw && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                <ShieldAlert className="text-red-500 shrink-0" size={20} />
                <div>
                  <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Access Restricted</p>
                  <p className="text-[10px] text-red-400/70 mt-1">
                    You need at least 500 TK to unlock the withdrawal protocol. Current: {balance} TK.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">PayPal Email</label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Amount (TK)</label>
                <input 
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase tracking-widest px-2">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading || !canWithdraw}
                className="w-full py-5 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:hover:scale-100"
              >
                INITIATE TRANSFER
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center py-8"
          >
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="text-yellow-500" size={40} />
            </div>
            <h3 className="text-2xl font-black uppercase italic mb-4">Confirm Transfer?</h3>
            <p className="text-gray-400 text-sm mb-8">
              You are about to withdraw <span className="text-white font-bold">{amount} TK</span> to <span className="text-white font-bold">{email}</span>. This action cannot be undone.
            </p>
            
            <div className="space-y-4">
              <button 
                onClick={confirmWithdraw}
                disabled={loading}
                className="w-full py-4 bg-cyan-500 text-black font-black rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                {loading ? "VERIFYING..." : "YES, CONFIRM WITHDRAWAL"}
              </button>
              <button 
                onClick={() => setStep('input')}
                disabled={loading}
                className="w-full py-4 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all"
              >
                CANCEL
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-4 opacity-30 grayscale">
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" referrerPolicy="no-referrer" />
        <div className="w-px h-4 bg-white/20" />
        <span className="text-[10px] font-bold tracking-widest uppercase">Verified Secure</span>
      </div>
    </motion.div>
  );
}
