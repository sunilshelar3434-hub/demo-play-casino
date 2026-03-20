import React, { createContext, useContext, useState, useCallback } from "react";

interface GameResult {
  id: string;
  game: string;
  bet: number;
  multiplier: number;
  payout: number;
  won: boolean;
  timestamp: number;
}

interface Streak {
  type: "win" | "lose";
  count: number;
}

interface BalanceContextType {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  placeBet: (amount: number) => boolean;
  addWinnings: (amount: number) => void;
  resetBalance: () => void;
  history: GameResult[];
  addResult: (result: Omit<GameResult, "id" | "timestamp">) => void;
  balancePulse: boolean;
  streak: Streak | null;
  displayBalance: number;
  bigWin: { amount: number } | null;
  clearBigWin: () => void;
  screenShake: boolean;
}

const BalanceContext = createContext<BalanceContextType | null>(null);

const INITIAL_BALANCE = 1000;
const BIG_WIN_THRESHOLD = 3; // multiplier threshold for big win

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [displayBalance, setDisplayBalance] = useState(INITIAL_BALANCE);
  const [history, setHistory] = useState<GameResult[]>([]);
  const [balancePulse, setBalancePulse] = useState(false);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [bigWin, setBigWin] = useState<{ amount: number } | null>(null);
  const [screenShake, setScreenShake] = useState(false);

  const triggerPulse = useCallback(() => {
    setBalancePulse(true);
    setTimeout(() => setBalancePulse(false), 400);
  }, []);

  const triggerShake = useCallback(() => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 400);
  }, []);

  // Animated count-up for display balance
  const animateBalance = useCallback((from: number, to: number) => {
    const diff = to - from;
    const steps = 20;
    const stepSize = diff / steps;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= steps) {
        setDisplayBalance(to);
        clearInterval(interval);
      } else {
        setDisplayBalance(from + stepSize * step);
      }
    }, 25);
  }, []);

  const placeBet = useCallback((amount: number) => {
    if (amount <= 0 || amount > balance) return false;
    const newBal = balance - amount;
    setBalance(newBal);
    animateBalance(balance, newBal);
    triggerPulse();
    return true;
  }, [balance, triggerPulse, animateBalance]);

  const addWinnings = useCallback((amount: number) => {
    if (amount > 0) {
      setBalance((b) => {
        const newBal = b + amount;
        animateBalance(b, newBal);
        return newBal;
      });
      triggerPulse();
    }
  }, [triggerPulse, animateBalance]);

  const resetBalance = useCallback(() => {
    setBalance(INITIAL_BALANCE);
    setDisplayBalance(INITIAL_BALANCE);
    setHistory([]);
    setStreak(null);
    triggerPulse();
  }, [triggerPulse]);

  const addResult = useCallback((result: Omit<GameResult, "id" | "timestamp">) => {
    const full: GameResult = {
      ...result,
      id: Math.random().toString(36).slice(2),
      timestamp: Date.now(),
    };
    setHistory((h) => [full, ...h].slice(0, 10));

    // Update streak
    setStreak((prev) => {
      if (!prev || prev.type !== (result.won ? "win" : "lose")) {
        return { type: result.won ? "win" : "lose", count: 1 };
      }
      return { ...prev, count: prev.count + 1 };
    });

    // Big win check
    if (result.won && result.multiplier >= BIG_WIN_THRESHOLD) {
      setBigWin({ amount: result.payout });
    }

    // Screen shake on loss
    if (!result.won) {
      triggerShake();
    }
  }, [triggerShake]);

  const clearBigWin = useCallback(() => setBigWin(null), []);

  return (
    <BalanceContext.Provider value={{
      balance, setBalance, placeBet, addWinnings, resetBalance,
      history, addResult, balancePulse, streak,
      displayBalance, bigWin, clearBigWin, screenShake
    }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => {
  const ctx = useContext(BalanceContext);
  if (!ctx) throw new Error("useBalance must be used within BalanceProvider");
  return ctx;
};
