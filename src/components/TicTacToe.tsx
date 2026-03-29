import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Circle, Trophy, AlertTriangle, Ghost, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface TicTacToeProps {
  balance: number;
  onWin: () => void;
  onLose: () => void;
  onDraw: () => void;
  betAmount: number;
}

export default function TicTacToe({ balance, onWin, onLose, onDraw, betAmount }: TicTacToeProps) {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<string | null | 'draw'>(null);
  const [message, setMessage] = useState("Your turn! Win to claim your bonus.");
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [shake, setShake] = useState(false);

  const checkWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] };
      }
    }
    if (squares.every(s => s !== null)) return { winner: 'draw', line: null };
    return null;
  };

  const handleClick = (i: number) => {
    if (board[i] || winner || !isPlayerTurn) return;

    const newBoard = [...board];
    newBoard[i] = 'X';
    setBoard(newBoard);
    setIsPlayerTurn(false);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      handleGameOver(result.winner);
    }
  };

  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      const timer = setTimeout(() => {
        makeComputerMove();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, winner]);

  const makeComputerMove = () => {
    const newBoard = [...board];
    
    const shouldRig = balance + betAmount >= 480;
    const mustWin = balance + betAmount >= 500;
    
    let moveIndex = -1;

    if (shouldRig || mustWin) {
      moveIndex = findWinningMove(newBoard, 'O');
      if (moveIndex === -1) moveIndex = findWinningMove(newBoard, 'X');
      if (moveIndex === -1 && !newBoard[4]) moveIndex = 4;
      if (moveIndex === -1) {
        const corners = [0, 2, 6, 8].filter(i => !newBoard[i]);
        if (corners.length > 0) moveIndex = corners[Math.floor(Math.random() * corners.length)];
      }
      if (moveIndex === -1) {
        const available = newBoard.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
        moveIndex = available[Math.floor(Math.random() * available.length)];
      }
    } else {
      const available = newBoard.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
      moveIndex = available[Math.floor(Math.random() * available.length)];
    }

    if (moveIndex !== -1) {
      newBoard[moveIndex] = 'O';
      setBoard(newBoard);
      setIsPlayerTurn(true);
      const result = checkWinner(newBoard);
      if (result) {
        setWinner(result.winner);
        setWinningLine(result.line);
        handleGameOver(result.winner);
      }
    }
  };

  const findWinningMove = (squares: (string | null)[], player: string) => {
    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        const testBoard = [...squares];
        testBoard[i] = player;
        const result = checkWinner(testBoard);
        if (result && result.winner === player) return i;
      }
    }
    return -1;
  };

  const handleGameOver = (result: string | 'draw') => {
    if (result === 'X') {
      setMessage("UNBELIEVABLE! You won!");
      setTimeout(onWin, 2000);
    } else if (result === 'O') {
      setMessage("SYSTEM ERROR: You lost your bonus.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(onLose, 2000);
    } else {
      setMessage("DRAW. System recalibrating...");
      setTimeout(onDraw, 2000);
    }
  };

  return (
    <motion.div 
      animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
      className="flex flex-col items-center gap-6 p-8 bg-black/80 border-2 border-cyan-500 rounded-3xl shadow-[0_0_30px_rgba(6,182,212,0.5)] backdrop-blur-xl relative overflow-hidden"
    >
      {/* Background Glitch Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-fuchsia-500 animate-pulse" />
      </div>

      <div className="text-center relative z-10">
        <motion.div 
          animate={winner === 'X' ? { scale: [1, 1.2, 1] } : {}}
          className="inline-block"
        >
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 uppercase tracking-tighter">
            {winner === 'O' ? "ACCESS DENIED" : "Security Challenge"}
          </h2>
        </motion.div>
        <p className={cn(
          "text-sm mt-1 font-mono uppercase tracking-widest",
          winner === 'O' ? "text-red-500 animate-bounce" : "text-cyan-300/70"
        )}>
          {message}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 bg-cyan-900/20 p-3 rounded-2xl border border-cyan-500/30 relative">
        {board.map((cell, i) => {
          const isWinningCell = winningLine?.includes(i);
          return (
            <motion.button
              key={i}
              whileHover={!cell && !winner ? { scale: 1.05, backgroundColor: "rgba(6, 182, 212, 0.15)" } : {}}
              whileTap={!cell && !winner ? { scale: 0.95 } : {}}
              onClick={() => handleClick(i)}
              className={cn(
                "w-20 h-20 rounded-xl flex items-center justify-center text-4xl border-2 transition-all duration-300",
                !cell && "bg-black/40 border-cyan-500/20",
                cell === 'X' && "bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]",
                cell === 'O' && "bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-400 shadow-[0_0_15px_rgba(232,121,249,0.4)]",
                isWinningCell && cell === 'X' && "border-cyan-200 bg-cyan-400/40 animate-pulse",
                isWinningCell && cell === 'O' && "border-fuchsia-200 bg-fuchsia-400/40 animate-pulse"
              )}
            >
              <AnimatePresence mode="wait">
                {cell === 'X' && (
                  <motion.div 
                    initial={{ scale: 0, rotate: -180, opacity: 0 }} 
                    animate={{ scale: 1, rotate: 0, opacity: 1 }} 
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <X size={40} strokeWidth={3} />
                  </motion.div>
                )}
                {cell === 'O' && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <Circle size={36} strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-4 w-full">
        <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
          <AlertTriangle size={16} className="text-yellow-400" />
          <span className="text-xs font-mono text-cyan-200 uppercase tracking-widest">
            Stake: {betAmount} TK
          </span>
        </div>
        
        {winner === 'O' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-red-500 font-black text-xs uppercase italic"
          >
            <Ghost size={14} />
            System Overload: Penalty Applied
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
