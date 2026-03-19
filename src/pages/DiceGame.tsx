import { useState } from "react";
import { useBalance } from "@/contexts/BalanceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BetMode = "under" | "over";

const DiceGame = () => {
  const { balance, placeBet, addWinnings, addResult } = useBalance();
  const [betAmount, setBetAmount] = useState(10);
  const [target, setTarget] = useState(50);
  const [mode, setMode] = useState<BetMode>("over");
  const [result, setResult] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [won, setWon] = useState<boolean | null>(null);

  const winChance = mode === "over" ? 100 - target : target;
  const multiplier = winChance > 0 ? +(98 / winChance).toFixed(4) : 0;

  const roll = () => {
    if (rolling) return;
    if (!placeBet(betAmount)) return;

    setRolling(true);
    setResult(null);
    setWon(null);

    // Animate rapid numbers
    let count = 0;
    const interval = setInterval(() => {
      setResult(Math.floor(Math.random() * 100) + 1);
      count++;
      if (count > 15) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 100) + 1;
        setResult(finalRoll);

        const isWin = mode === "over" ? finalRoll > target : finalRoll < target;
        setWon(isWin);

        if (isWin) {
          const payout = betAmount * multiplier;
          addWinnings(payout);
          addResult({ game: "Dice", bet: betAmount, multiplier, payout, won: true });
        } else {
          addResult({ game: "Dice", bet: betAmount, multiplier: 0, payout: 0, won: false });
        }

        setRolling(false);
      }
    }, 50);
  };

  return (
    <div className="container max-w-4xl py-8 animate-fade-in">
      <h1 className="mb-8 text-3xl font-extrabold text-foreground">Dice</h1>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        {/* Controls */}
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Bet Amount</label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={1}
                max={balance}
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                className="bg-secondary text-foreground"
              />
              <Button variant="outline" size="sm" onClick={() => setBetAmount(Math.floor(balance / 2))}>½</Button>
              <Button variant="outline" size="sm" onClick={() => setBetAmount(Math.floor(balance))}>Max</Button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Target ({target})</label>
            <input
              type="range"
              min={2}
              max={98}
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="w-full accent-interactive"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={mode === "over" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setMode("over")}
            >
              Over {target}
            </Button>
            <Button
              variant={mode === "under" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setMode("under")}
            >
              Under {target}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-secondary p-3">
              <span className="text-muted-foreground">Win Chance</span>
              <p className="text-lg font-bold text-foreground">{winChance}%</p>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <span className="text-muted-foreground">Multiplier</span>
              <p className="text-lg font-bold text-primary">{multiplier}x</p>
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={roll} disabled={rolling || betAmount > balance}>
            {rolling ? "Rolling..." : "Roll Dice"}
          </Button>
        </div>

        {/* Stage */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-8">
          <div
            className={`text-8xl font-extrabold tabular-nums transition-all duration-200 ${
              won === true ? "text-win text-glow-green" : won === false ? "text-lose text-glow-red" : "text-foreground"
            }`}
            style={rolling ? { animation: "countUp 0.05s ease-out" } : undefined}
          >
            {result ?? "—"}
          </div>

          {won !== null && !rolling && (
            <div className={`mt-4 text-xl font-bold ${won ? "text-win" : "text-lose"}`}>
              {won ? `You won ${(betAmount * multiplier).toFixed(2)} credits!` : "Better luck next time!"}
            </div>
          )}

          {/* Visual bar */}
          <div className="mt-8 w-full max-w-md">
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
              {mode === "over" ? (
                <>
                  <div className="absolute left-0 top-0 h-full bg-lose/50" style={{ width: `${target}%` }} />
                  <div className="absolute right-0 top-0 h-full bg-win/50" style={{ width: `${100 - target}%` }} />
                </>
              ) : (
                <>
                  <div className="absolute left-0 top-0 h-full bg-win/50" style={{ width: `${target}%` }} />
                  <div className="absolute right-0 top-0 h-full bg-lose/50" style={{ width: `${100 - target}%` }} />
                </>
              )}
              {result && (
                <div
                  className="absolute top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-foreground shadow-lg transition-all duration-300"
                  style={{ left: `${result}%` }}
                />
              )}
            </div>
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>{target}</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiceGame;
