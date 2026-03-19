import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useBalance } from "@/contexts/BalanceContext";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Clock, Copy, Check, Bitcoin, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FAKE_ADDRESSES: Record<string, string> = {
  BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  ETH: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  USDT: "TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9",
};

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  created_at: string;
}

const WalletPage = () => {
  const { user, profile } = useAuth();
  const { displayBalance } = useBalance();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [copied, setCopied] = useState(false);
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setTransactions(data as Transaction[]);
      });
  }, [user]);

  const copyAddress = () => {
    navigator.clipboard.writeText(FAKE_ADDRESSES[selectedCrypto]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Address copied to clipboard" });
  };

  const handleDeposit = async () => {
    if (!user) return;
    const amount = 100 + Math.floor(Math.random() * 900);
    await supabase.from("transactions").insert({
      user_id: user.id,
      type: "deposit",
      amount,
      currency: selectedCrypto,
      status: "completed",
      description: `${selectedCrypto} deposit`,
    });
    toast({ title: "Deposit simulated!", description: `${amount} credits added` });
    // Refresh
    const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
    if (data) setTransactions(data as Transaction[]);
  };

  const handleWithdraw = async () => {
    if (!user || !withdrawAddress.trim() || !withdrawAmount) return;
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    await supabase.from("transactions").insert({
      user_id: user.id,
      type: "withdraw",
      amount: amt,
      currency: selectedCrypto,
      status: "pending",
      description: `Withdraw to ${withdrawAddress.slice(0, 10)}...`,
    });
    toast({ title: "Withdrawal submitted!", description: `${amt} ${selectedCrypto} pending` });
    setWithdrawAddress("");
    setWithdrawAmount("");
    const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
    if (data) setTransactions(data as Transaction[]);
  };

  const statusColor: Record<string, string> = {
    completed: "text-primary",
    pending: "text-yellow-400",
    failed: "text-destructive",
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="glass-card p-8 text-center">
          <Wallet className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Sign in to access Wallet</h2>
          <p className="text-muted-foreground text-sm">Create an account to deposit, withdraw, and track your balance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Wallet</h1>
        <p className="text-muted-foreground text-sm">Manage your demo funds</p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Demo Balance", value: `${displayBalance.toFixed(2)}`, icon: Coins, color: "text-primary" },
          { label: "Total Wagered", value: `${profile?.total_wagered?.toFixed(2) ?? "0.00"}`, icon: Bitcoin, color: "text-accent" },
          { label: "Total Profit", value: `${profile?.total_profit?.toFixed(2) ?? "0.00"}`, icon: ArrowUpFromLine, color: profile && profile.total_profit >= 0 ? "text-primary" : "text-destructive" },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-secondary">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="glass-card p-6">
            <h3 className="font-bold text-foreground mb-2">Account Overview</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Username:</span> <span className="text-foreground font-medium">{profile?.username}</span></div>
              <div><span className="text-muted-foreground">VIP Level:</span> <span className="text-primary font-medium capitalize">{profile?.vip_level}</span></div>
              <div><span className="text-muted-foreground">Total Bets:</span> <span className="text-foreground font-medium">{profile?.total_bets}</span></div>
              <div><span className="text-muted-foreground">Win Rate:</span> <span className="text-foreground font-medium">{profile && profile.total_bets > 0 ? ((profile.total_wins / profile.total_bets) * 100).toFixed(1) : 0}%</span></div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="deposit" className="mt-4 space-y-4">
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-foreground">Deposit Crypto (Demo)</h3>
            <div className="flex gap-2">
              {["BTC", "ETH", "USDT"].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCrypto(c)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${selectedCrypto === c ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-xs text-muted-foreground mb-2">Send {selectedCrypto} to this address:</p>
              <div className="flex items-center gap-2">
                <code className="text-xs text-foreground font-mono flex-1 break-all">{FAKE_ADDRESSES[selectedCrypto]}</code>
                <Button variant="outline" size="sm" onClick={copyAddress}>
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            <Button onClick={handleDeposit} className="w-full gap-2">
              <ArrowDownToLine className="h-4 w-4" />
              Simulate Deposit
            </Button>
            <p className="text-xs text-muted-foreground text-center">Demo only — no real transactions</p>
          </div>
        </TabsContent>

        <TabsContent value="withdraw" className="mt-4 space-y-4">
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-foreground">Withdraw (Demo)</h3>
            <div className="flex gap-2">
              {["BTC", "ETH", "USDT"].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCrypto(c)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${selectedCrypto === c ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <Input value={withdrawAddress} onChange={(e) => setWithdrawAddress(e.target.value)} placeholder={`${selectedCrypto} address`} className="bg-secondary" />
            <Input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Amount" className="bg-secondary" />
            <Button onClick={handleWithdraw} variant="outline" className="w-full gap-2">
              <ArrowUpFromLine className="h-4 w-4" />
              Submit Withdrawal
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No transactions yet</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${tx.type === "deposit" ? "bg-primary/10" : tx.type === "withdraw" ? "bg-destructive/10" : "bg-accent/10"}`}>
                      {tx.type === "deposit" ? <ArrowDownToLine className="h-4 w-4 text-primary" /> : <ArrowUpFromLine className="h-4 w-4 text-destructive" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground capitalize">{tx.type}</p>
                      <p className="text-xs text-muted-foreground">{tx.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold tabular-nums ${tx.type === "deposit" || tx.type === "win" || tx.type === "bonus" ? "text-primary" : "text-destructive"}`}>
                      {tx.type === "deposit" || tx.type === "win" || tx.type === "bonus" ? "+" : "-"}{tx.amount.toFixed(2)}
                    </p>
                    <p className={`text-xs ${statusColor[tx.status]}`}>{tx.status}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletPage;
