import { useState, useCallback } from "react";
import { useBalance } from "@/contexts/BalanceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gem, Bomb } from "lucide-react";

const GRID_SIZE = 5;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

type TileState = "hidden" | "gem" | "mine";

const MinesGame = () => {
  const { balance, placeBet, addWinnings, addResult } = useBalance();
  const [betAmount, setBetAmount] = useState(10);
  const [mineCount, setMineCount] = useState(5);
  const [gameState, setGameState] = useState<"idle" | "playing" | "won" | "lost">("idle");
  const [tiles, setTiles] = useState<TileState[]>(Array(TOTAL_TILES).fill("hidden"));
  const [minePositions, setMinePositions] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);

  const calcMultiplier = useCallback((picks: number, mines: number) => {
    // Simple multiplier based on probability
    let mult = 1;
    for (let i = 0; i < picks; i++) {
      mult *= (TOTAL_TILES - mines - i) > 0 ? (TOTAL_TILES - i) / (TOTAL_TILES - mines - i) : 1;
    }
    return +(mult * 0.97).toFixed(2); // 3% house edge
  }, []);

  const startGame = () => {
    if (!placeBet(betAmount)) return;

    // Place mines randomly
    const positions = new Set<number>();
    while (positions.size < mineCount) {
      positions.add(Math.floor(Math.random() * TOTAL_TILES));
    }
    setMinePositions(positions);
    setTiles(Array(TOTAL_TILES).fill("hidden"));
    setRevealed(0);
    setCurrentMultiplier(1.0);
    setGameState("playing");
  };

  const revealTile = (index: number) => {
    if (gameState !== "playing" || tiles[index] !== "hidden") return;

    const newTiles = [...tiles];

    if (minePositions.has(index)) {
      // Hit a mine - reveal all
      newTiles[index] = "mine";
      minePositions.forEach((pos) => {
        newTiles[pos] = "mine";
      });
      setTiles(newTiles);
      setGameState("lost");
      addResult({ game: "Mines", bet: betAmount, multiplier: 0, payout: 0, won: false });
      return;
    }

    newTiles[index] = "gem";
    setTiles(newTiles);
    const newRevealed = revealed + 1;
    setRevealed(newRevealed);
    const mult = calcMultiplier(newRevealed, mineCount);
    setCurrentMultiplier(mult);

    // Auto-win if all safe tiles revealed
    if (newRevealed === TOTAL_TILES - mineCount) {
      const payout = betAmount * mult;
      addWinnings(payout);
      addResult({ game: "Mines", bet: betAmount, multiplier: mult, payout, won: true });
      setGameState("won");
    }
  };

  const cashOut = () => {
    if (gameState !== "playing" || revealed === 0) return;
    const payout = betAmount * currentMultiplier;
    addWinnings(payout);
    addResult({ game: "Mines", bet: betAmount, multiplier: currentMultiplier, payout, won: true });

    // Reveal all mines
    const newTiles = [...tiles];
    minePositions.forEach((pos) => {
      if (newTiles[pos] === "hidden") newTiles[pos] = "mine";
    });
    setTiles(newTiles);
    setGameState("won");
  };

  const getTileClasses = (state: TileState) => {
    switch (state) {
      case "hidden":
        return "bg-secondary hover:bg-secondary/70 border-border cursor-pointer hover:scale-105";
      case "gem":
        return "bg-primary/20 border-primary/50";
      case "mine":
        return "bg-destructive/20 border-destructive/50";
    }
  };

  return (
    <div className="container max-w-4xl py-8 animate-fade-in">
      <h1 className="mb-8 text-3xl font-extrabold text-foreground">Mines</h1>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
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
                disabled={gameState === "playing"}
              />
              <Button variant="outline" size="sm" onClick={() => setBetAmount(Math.floor(balance / 2))} disabled={gameState === "playing"}>½</Button>
              <Button variant="outline" size="sm" onClick={() => setBetAmount(Math.floor(balance))} disabled={gameState === "playing"}>Max</Button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Mines ({mineCount})</label>
            <input
              type="range"
              min={1}
              max={24}
              value={mineCount}
              onChange={(e) => setMineCount(Number(e.target.value))}
              className="w-full accent-destructive"
              disabled={gameState === "playing"}
            />
          </div>

          {gameState === "playing" && (
            <div className="rounded-lg bg-secondary p-3 text-center">
              <span className="text-sm text-muted-foreground">Current Multiplier</span>
              <p className="text-2xl font-bold text-primary">{currentMultiplier}x</p>
              <p className="text-xs text-muted-foreground">
                Payout: {(betAmount * currentMultiplier).toFixed(2)}
              </p>
            </div>
          )}

          {gameState === "idle" || gameState === "won" || gameState === "lost" ? (
            <Button className="w-full" size="lg" onClick={startGame} disabled={betAmount > balance}>
              {gameState === "idle" ? "Start Game" : "Play Again"}
            </Button>
          ) : (
            <Button
              className="w-full"
              size="lg"
              variant="accent"
              onClick={cashOut}
              disabled={revealed === 0}
            >
              Cash Out ({(betAmount * currentMultiplier).toFixed(2)})
            </Button>
          )}

          {gameState === "won" && (
            <div className="text-center text-lg font-bold text-win text-glow-green">
              Won {(betAmount * currentMultiplier).toFixed(2)} credits!
            </div>
          )}
          {gameState === "lost" && (
            <div className="text-center text-lg font-bold text-lose text-glow-red">
              Boom! You hit a mine! 💥
            </div>
          )}
        </div>

        <div className="flex items-center justify-center rounded-xl border border-border bg-card p-6">
          <div className="grid grid-cols-5 gap-2 w-full max-w-[350px] aspect-square">
            {tiles.map((state, i) => (
              <button
                key={i}
                onClick={() => revealTile(i)}
                disabled={gameState !== "playing" || state !== "hidden"}
                className={`flex items-center justify-center rounded-lg border transition-all duration-200 btn-press ${getTileClasses(state)}`}
              >
                {state === "gem" && <Gem className="h-5 w-5 text-primary" />}
                {state === "mine" && <Bomb className="h-5 w-5 text-destructive" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinesGame;
