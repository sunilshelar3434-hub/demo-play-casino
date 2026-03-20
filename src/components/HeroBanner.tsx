import { motion } from "framer-motion";
import { Coins, Zap, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HeroBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-secondary to-card p-6 md:p-10">
      {/* Animated bg elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -15, 0], y: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-accent/10 blur-3xl"
        />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-3"
          >
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Featured</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight"
          >
            Play & Win with
            <span className="text-primary text-glow-green"> Demo Credits</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mt-2 max-w-md"
          >
            No real money — experience the thrill of casino games with virtual credits. Play Dice, Crash, Mines & Plinko.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-3 mt-5"
          >
            <Button size="lg" onClick={() => navigate("/crash")} className="gap-2">
              <Coins className="h-4 w-4" />
              Play Now
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/casino")}>
              Browse Games
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="flex gap-4"
        >
          {[
            { icon: Trophy, label: "4 Games", sub: "Originals" },
            { icon: Coins, label: "1,000", sub: "Free Credits" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 text-center min-w-[100px]">
              <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-lg font-bold text-foreground">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default HeroBanner;
