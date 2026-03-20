import { useNavigate } from "react-router-dom";
import { Dices, ArrowDown, Bomb, TrendingUp, Flame, Star, Clock } from "lucide-react";
import HeroBanner from "@/components/HeroBanner";
import GameCard from "@/components/GameCard";
import GameCarousel from "@/components/GameCarousel";
import GameHistory from "@/components/GameHistory";

const games = [
  { name: "Dice", description: "Roll over or under your target number", icon: Dices, path: "/dice", color: "bg-accent/10 text-accent" },
  { name: "Plinko", description: "Drop the ball and watch it bounce", icon: ArrowDown, path: "/plinko", color: "bg-primary/10 text-primary" },
  { name: "Crash", description: "Cash out before the multiplier crashes", icon: TrendingUp, path: "/crash", color: "bg-destructive/10 text-destructive" },
  { name: "Mines", description: "Reveal gems and avoid the bombs", icon: Bomb, path: "/mines", color: "bg-accent/10 text-accent" },
];

const comingSoon = [
  { name: "Blackjack", description: "Classic card game", icon: Star, path: "#", color: "bg-primary/10 text-primary" },
  { name: "Roulette", description: "Spin the wheel", icon: Clock, path: "#", color: "bg-destructive/10 text-destructive" },
  { name: "Slots", description: "Spin to win", icon: Flame, path: "#", color: "bg-accent/10 text-accent" },
  { name: "Baccarat", description: "Player vs Banker", icon: Star, path: "#", color: "bg-primary/10 text-primary" },
  { name: "Keno", description: "Pick your numbers", icon: Dices, path: "#", color: "bg-accent/10 text-accent" },
];

const Index = () => {
  return (
    <div className="space-y-8 animate-fade-in p-4 md:p-6">
      <HeroBanner />

      {/* Popular Games - Carousel */}
      <GameCarousel title="🔥 Popular Games">
        {games.map((game, i) => (
          <div key={game.name} className="shrink-0 w-44">
            <GameCard {...game} index={i} />
          </div>
        ))}
      </GameCarousel>

      {/* Originals Grid */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" /> NeoVegas Originals
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {games.map((game, i) => (
            <GameCard key={game.name} {...game} index={i} />
          ))}
        </div>
      </div>

      {/* Coming Soon - Carousel */}
      <GameCarousel title="🆕 Coming Soon">
        {comingSoon.map((game, i) => (
          <div key={game.name} className="shrink-0 w-44 opacity-60">
            <GameCard {...game} index={i} provider="Coming Soon" />
          </div>
        ))}
      </GameCarousel>

      <GameHistory />
    </div>
  );
};

export default Index;
