import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Gift, Crown, Clock, Sparkles, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const VIP_LEVELS = [
  { name: "Bronze", threshold: 0, color: "text-amber-600", bonus: 10 },
  { name: "Silver", threshold: 5000, color: "text-gray-300", bonus: 25 },
  { name: "Gold", threshold: 25000, color: "text-yellow-400", bonus: 50 },
  { name: "Platinum", threshold: 100000, color: "text-cyan-300", bonus: 100 },
  { name: "Diamond", threshold: 500000, color: "text-blue-400", bonus: 250 },
];

const PROMO_CARDS = [
  { title: "Daily Bonus", desc: "Claim free credits every 24 hours", icon: Gift, color: "bg-primary/10 text-primary" },
  { title: "Weekly Cashback", desc: "Get 5% back on net losses every Monday", icon: Sparkles, color: "bg-accent/10 text-accent" },
  { title: "Reload Bonus", desc: "50% bonus on deposits over 500 credits", icon: Crown, color: "bg-destructive/10 text-destructive" },
];

const VIPPage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [cooldownMs, setCooldownMs] = useState(0);

  const currentLevel = VIP_LEVELS.findIndex((l) => l.name.toLowerCase() === (profile?.vip_level ?? "bronze"));
  const nextLevel = VIP_LEVELS[Math.min(currentLevel + 1, VIP_LEVELS.length - 1)];
  const wagered = profile?.total_wagered ?? 0;
  const progressToNext = currentLevel < VIP_LEVELS.length - 1
    ? ((wagered - VIP_LEVELS[currentLevel].threshold) / (nextLevel.threshold - VIP_LEVELS[currentLevel].threshold)) * 100
    : 100;

  // Cooldown timer
  useEffect(() => {
    if (!profile?.last_daily_bonus) { setCooldownMs(0); return; }
    const update = () => {
      const diff = new Date(profile.last_daily_bonus!).getTime() + 24 * 60 * 60 * 1000 - Date.now();
      setCooldownMs(Math.max(0, diff));
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [profile?.last_daily_bonus]);

  const claimDailyBonus = useCallback(async () => {
    if (!user || cooldownMs > 0) return;
    const bonusAmount = VIP_LEVELS[currentLevel].bonus;
    await supabase.from("profiles").update({ last_daily_bonus: new Date().toISOString() }).eq("user_id", user.id);
    await supabase.from("transactions").insert({
      user_id: user.id, type: "bonus", amount: bonusAmount, description: "Daily bonus claim",
    });
    await refreshProfile();
    toast({ title: "🎁 Daily Bonus Claimed!", description: `+${bonusAmount} credits added` });
  }, [user, cooldownMs, currentLevel, refreshProfile, toast]);

  const formatCooldown = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="glass-card p-8 text-center">
          <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Sign in to access VIP</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
        <Crown className="h-6 w-6 text-primary" /> VIP Club & Rewards
      </h1>

      {/* VIP Progress */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Current Level</p>
            <p className={`text-2xl font-extrabold capitalize ${VIP_LEVELS[currentLevel].color}`}>
              {VIP_LEVELS[currentLevel].name}
            </p>
          </div>
          {currentLevel < VIP_LEVELS.length - 1 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Next Level</p>
              <p className={`text-lg font-bold capitalize ${nextLevel.color}`}>{nextLevel.name}</p>
            </div>
          )}
        </div>
        <Progress value={Math.min(progressToNext, 100)} className="h-2 mb-2" />
        <p className="text-xs text-muted-foreground">
          {wagered.toFixed(0)} / {nextLevel.threshold.toLocaleString()} wagered
        </p>
      </motion.div>

      {/* Daily Bonus */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Daily Bonus</h3>
              <p className="text-sm text-muted-foreground">+{VIP_LEVELS[currentLevel].bonus} credits</p>
            </div>
          </div>
          {cooldownMs > 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-mono tabular-nums">{formatCooldown(cooldownMs)}</span>
            </div>
          ) : (
            <Button onClick={claimDailyBonus} className="gap-1.5 glow-green">
              <Gift className="h-4 w-4" />
              Claim
            </Button>
          )}
        </div>
      </motion.div>

      {/* VIP Tiers */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-3">VIP Tiers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {VIP_LEVELS.map((level, i) => (
            <div
              key={level.name}
              className={`rounded-xl border p-4 transition-colors ${
                i === currentLevel ? "border-primary bg-primary/5" : "border-border bg-card"
              }`}
            >
              <p className={`font-bold ${level.color}`}>{level.name}</p>
              <p className="text-xs text-muted-foreground mt-1">Wager {level.threshold.toLocaleString()}+</p>
              <p className="text-sm text-foreground mt-2">Daily bonus: <span className="text-primary font-bold">{level.bonus}</span></p>
            </div>
          ))}
        </div>
      </div>

      {/* Promotions */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-3">Promotions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PROMO_CARDS.map((promo) => (
            <motion.div key={promo.title} whileHover={{ scale: 1.02 }} className="glass-card p-4 cursor-pointer">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${promo.color} mb-3`}>
                <promo.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">{promo.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{promo.desc}</p>
              <div className="flex items-center gap-1 text-primary text-xs mt-2 font-medium">
                Learn more <ChevronRight className="h-3 w-3" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VIPPage;
