import { useNavigate } from "react-router-dom";
import { Dices, ArrowDown, Bomb, TrendingUp } from "lucide-react";
import GameHistory from "@/components/GameHistory";

const games = [
  {
    name: "Dice",
    description: "Roll over or under your target number",
    icon: Dices,
    path: "/dice",
    color: "bg-accent/10 text-accent",
    glowClass: "glow-blue",
  },
  {
    name: "Plinko",
    description: "Drop the ball and watch it bounce",
    icon: ArrowDown,
    path: "/plinko",
    color: "bg-primary/10 text-primary",
    glowClass: "glow-green",
  },
  {
    name: "Crash",
    description: "Cash out before the multiplier crashes",
    icon: TrendingUp,
    path: "/crash",
    color: "bg-destructive/10 text-destructive",
    glowClass: "glow-red",
  },
  {
    name: "Mines",
    description: "Reveal gems and avoid the bombs",
    icon: Bomb,
    path: "/mines",
    color: "bg-accent/10 text-accent",
    glowClass: "glow-blue",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-8 animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
          Choose Your Game
        </h1>
        <p className="mt-2 text-muted-foreground">
          No real money — just pure fun with demo credits
        </p>
      </div>

      <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
        {games.map((game) => (
          <button
            key={game.name}
            onClick={() => navigate(game.path)}
            className={`group relative overflow-hidden rounded-xl border border-border bg-card p-6 text-left transition-all duration-200 hover:border-primary/50 hover:scale-[1.02] btn-press`}
          >
            <div className={`mb-4 inline-flex rounded-lg p-3 ${game.color}`}>
              <game.icon className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-card-foreground">{game.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{game.description}</p>
            <div className="absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100" style={{ boxShadow: "inset 0 0 30px hsl(var(--primary) / 0.05)" }} />
          </button>
        ))}
      </div>

      <GameHistory />
    </div>
  );
};

export default Index;
