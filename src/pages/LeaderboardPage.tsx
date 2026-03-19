import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Medal, TrendingUp, Coins } from "lucide-react";

interface LeaderboardEntry {
  username: string;
  display_name: string;
  vip_level: string;
  total_wagered: number;
  total_profit: number;
  total_bets: number;
  user_id: string;
}

const tabs = [
  { key: "wagered", label: "Most Wagered", icon: Coins },
  { key: "profit", label: "Top Profit", icon: TrendingUp },
];

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("wagered");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const col = activeTab === "wagered" ? "total_wagered" : "total_profit";
    supabase
      .from("profiles")
      .select("username, display_name, vip_level, total_wagered, total_profit, total_bets, user_id")
      .order(col, { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setEntries((data as LeaderboardEntry[]) ?? []);
        setLoading(false);
      });
  }, [activeTab]);

  const getRankIcon = (i: number) => {
    if (i === 0) return <span className="text-yellow-400 text-lg">🥇</span>;
    if (i === 1) return <span className="text-gray-300 text-lg">🥈</span>;
    if (i === 2) return <span className="text-amber-600 text-lg">🥉</span>;
    return <span className="text-muted-foreground text-sm font-bold w-5 text-center">{i + 1}</span>;
  };

  // Weekly reset timer (mock - next Monday)
  const now = new Date();
  const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
  const nextReset = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilMonday);
  const hoursLeft = Math.floor((nextReset.getTime() - now.getTime()) / (1000 * 60 * 60));

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" /> Leaderboard
          </h1>
          <p className="text-muted-foreground text-sm">Top players this week</p>
        </div>
        <div className="glass-card px-3 py-2 text-center">
          <p className="text-xs text-muted-foreground">Resets in</p>
          <p className="text-sm font-bold text-primary tabular-nums">{hoursLeft}h</p>
        </div>
      </div>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeTab === t.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-secondary animate-pulse" />
          ))
        ) : entries.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <Medal className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No players yet. Be the first!</p>
          </div>
        ) : (
          entries.map((entry, i) => (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
                user?.id === entry.user_id ? "border-primary/40 bg-primary/5" : "border-border bg-card"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 flex justify-center">{getRankIcon(i)}</div>
                <div>
                  <p className="text-sm font-medium text-foreground">{entry.display_name || entry.username}</p>
                  <p className="text-xs text-primary capitalize">{entry.vip_level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold tabular-nums text-foreground">
                  {activeTab === "wagered" ? entry.total_wagered.toFixed(2) : entry.total_profit.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">{entry.total_bets} bets</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
