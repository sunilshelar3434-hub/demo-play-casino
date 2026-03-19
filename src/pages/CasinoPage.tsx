import { Dices, ArrowDown, Bomb, TrendingUp, Star, Flame, Clock } from "lucide-react";
import GameCard from "@/components/GameCard";
import { useState } from "react";
import { motion } from "framer-motion";

const allGames = [
  { name: "Dice", description: "Roll over or under your target number", icon: Dices, path: "/dice", color: "bg-accent/10 text-accent", category: "originals" },
  { name: "Plinko", description: "Drop the ball and watch it bounce", icon: ArrowDown, path: "/plinko", color: "bg-primary/10 text-primary", category: "originals" },
  { name: "Crash", description: "Cash out before the multiplier crashes", icon: TrendingUp, path: "/crash", color: "bg-destructive/10 text-destructive", category: "originals" },
  { name: "Mines", description: "Reveal gems and avoid the bombs", icon: Bomb, path: "/mines", color: "bg-accent/10 text-accent", category: "originals" },
  { name: "Blackjack", description: "Classic card game", icon: Star, path: "#", color: "bg-primary/10 text-primary", category: "live" },
  { name: "Roulette", description: "Spin the wheel", icon: Clock, path: "#", color: "bg-destructive/10 text-destructive", category: "live" },
  { name: "Slots", description: "Spin to win jackpots", icon: Flame, path: "#", color: "bg-accent/10 text-accent", category: "slots" },
  { name: "Baccarat", description: "Player vs Banker", icon: Star, path: "#", color: "bg-primary/10 text-primary", category: "live" },
];

const tabs = [
  { key: "all", label: "All Games" },
  { key: "originals", label: "Originals" },
  { key: "slots", label: "Slots" },
  { key: "live", label: "Live Casino" },
];

const CasinoPage = () => {
  const [activeTab, setActiveTab] = useState("all");

  const filtered = activeTab === "all" ? allGames : allGames.filter((g) => g.category === activeTab);

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Casino</h1>
        <p className="text-muted-foreground text-sm mt-1">Browse all available games</p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Game grid */}
      <motion.div
        layout
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
      >
        {filtered.map((game, i) => (
          <GameCard key={game.name} {...game} index={i} provider={game.category === "originals" ? "NeoVegas Originals" : "Coming Soon"} />
        ))}
      </motion.div>
    </div>
  );
};

export default CasinoPage;
