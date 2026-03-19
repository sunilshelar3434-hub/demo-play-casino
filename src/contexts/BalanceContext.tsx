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

interface BalanceContextType {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  placeBet: (amount: number) => boolean;
  addWinnings: (amount: number) => void;
  resetBalance: () => void;
  history: GameResult[];
  addResult: (result: Omit<GameResult, "id" | "timestamp">) => void;
  balancePulse: boolean;
}

const BalanceContext = createContext<BalanceContextType | null>(null);

const INITIAL_BALANCE = 1000;

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [history, setHistory] = useState<GameResult[]>([]);
  const [balancePulse, setBalancePulse] = useState(false);

  const triggerPulse = useCallback(() => {
    setBalancePulse(true);
    setTimeout(() => setBalancePulse(false), 400);
  }, []);

  const placeBet = useCallback((amount: number) => {
    if (amount <= 0 || amount > balance) return false;
    setBalance((b) => b - amount);
    triggerPulse();
    return true;
  }, [balance, triggerPulse]);

  const addWinnings = useCallback((amount: number) => {
    if (amount > 0) {
      setBalance((b) => b + amount);
      triggerPulse();
    }
  }, [triggerPulse]);

  const resetBalance = useCallback(() => {
    setBalance(INITIAL_BALANCE);
    setHistory([]);
    triggerPulse();
  }, [triggerPulse]);

  const addResult = useCallback((result: Omit<GameResult, "id" | "timestamp">) => {
    const full: GameResult = {
      ...result,
      id: Math.random().toString(36).slice(2),
      timestamp: Date.now(),
    };
    setHistory((h) => [full, ...h].slice(0, 10));
  }, []);

  return (
    <BalanceContext.Provider value={{ balance, setBalance, placeBet, addWinnings, resetBalance, history, addResult, balancePulse }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => {
  const ctx = useContext(BalanceContext);
  if (!ctx) throw new Error("useBalance must be used within BalanceProvider");
  return ctx;
};
