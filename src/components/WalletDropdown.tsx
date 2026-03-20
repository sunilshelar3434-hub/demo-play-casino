import { useBalance } from "@/contexts/BalanceContext";
import { Bitcoin, Coins, ArrowDownToLine, ArrowUpFromLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const cryptoBalances = [
  { name: "BTC", icon: Bitcoin, amount: "0.00000", usd: "$0.00" },
  { name: "ETH", icon: Coins, amount: "0.00000", usd: "$0.00" },
  { name: "USDT", icon: Coins, amount: "0.00", usd: "$0.00" },
];

const WalletDropdown = ({ onClose }: { onClose: () => void }) => {
  const { displayBalance } = useBalance();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-72 rounded-xl glass-card p-4 z-50 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground">Wallet</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-lg bg-secondary p-3 mb-3">
        <p className="text-xs text-muted-foreground mb-1">Demo Balance</p>
        <p className="text-xl font-bold text-primary tabular-nums">{displayBalance.toFixed(2)} Credits</p>
      </div>

      <div className="space-y-2 mb-3">
        {cryptoBalances.map((c) => (
          <div key={c.name} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-secondary/50 transition-colors">
            <div className="flex items-center gap-2">
              <c.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{c.name}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-mono text-foreground">{c.amount}</p>
              <p className="text-xs text-muted-foreground">{c.usd}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button size="sm" className="flex-1 gap-1.5">
          <ArrowDownToLine className="h-3.5 w-3.5" />
          Deposit
        </Button>
        <Button variant="outline" size="sm" className="flex-1 gap-1.5">
          <ArrowUpFromLine className="h-3.5 w-3.5" />
          Withdraw
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center">Demo mode — no real crypto</p>
    </motion.div>
  );
};

export default WalletDropdown;
