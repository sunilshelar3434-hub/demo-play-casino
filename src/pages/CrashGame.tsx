import { useState, useRef, useEffect, useCallback } from "react";
import { useBalance } from "@/contexts/BalanceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CrashGame = () => {
  const { balance, placeBet, addWinnings, addResult } = useBalance();
  const [betAmount, setBetAmount] = useState(10);
  const [gameState, setGameState] = useState<"idle" | "running" | "crashed" | "cashed_out">("idle");
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(0);
  const [cashedOutAt, setCashedOutAt] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<number[]>([]);

  const generateCrashPoint = () => {
    // House edge ~3%
    const r = Math.random();
    if (r < 0.03) return 1.0;
    return +(1 / (1 - r)).toFixed(2);
  };

  const drawGraph = useCallback((points: number[], crashed: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = "hsl(217, 33%, 20%)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      const y = h - (i / 5) * h;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
      ctx.fillStyle = "hsl(215, 25%, 43%)";
      ctx.font = "11px Inter";
      ctx.fillText(`${(i * 2).toFixed(1)}x`, 5, y + 14);
    }

    if (points.length < 2) return;

    const maxMult = Math.max(...points, 2);
    const xStep = w / Math.max(points.length - 1, 1);

    ctx.beginPath();
    ctx.moveTo(0, h);
    points.forEach((p, i) => {
      const x = i * xStep;
      const y = h - ((p - 1) / (maxMult - 1 + 0.5)) * h * 0.85;
      ctx.lineTo(x, y);
    });

    const gradient = ctx.createLinearGradient(0, h, 0, 0);
    if (crashed) {
      gradient.addColorStop(0, "hsl(0, 84%, 60%, 0.05)");
      gradient.addColorStop(1, "hsl(0, 84%, 60%, 0.2)");
      ctx.strokeStyle = "hsl(0, 84%, 60%)";
    } else {
      gradient.addColorStop(0, "hsl(160, 84%, 39%, 0.05)");
      gradient.addColorStop(1, "hsl(160, 84%, 39%, 0.2)");
      ctx.strokeStyle = "hsl(160, 84%, 39%)";
    }
    ctx.lineWidth = 3;
    ctx.stroke();

    // Fill area
    const lastX = (points.length - 1) * xStep;
    ctx.lineTo(lastX, h);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
  }, []);

  const startGame = () => {
    if (!placeBet(betAmount)) return;

    const cp = generateCrashPoint();
    setCrashPoint(cp);
    setCurrentMultiplier(1.0);
    setCashedOutAt(0);
    setGameState("running");
    pointsRef.current = [1.0];

    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const mult = +(1 + elapsed * 0.5 + elapsed * elapsed * 0.05).toFixed(2);

      if (mult >= cp) {
        setCurrentMultiplier(cp);
        pointsRef.current.push(cp);
        drawGraph(pointsRef.current, true);
        setGameState("crashed");
        addResult({ game: "Crash", bet: betAmount, multiplier: 0, payout: 0, won: false });
        clearInterval(intervalRef.current);
      } else {
        setCurrentMultiplier(mult);
        pointsRef.current.push(mult);
        drawGraph(pointsRef.current, false);
      }
    }, 50);
  };

  const cashOut = () => {
    if (gameState !== "running") return;
    clearInterval(intervalRef.current);
    setCashedOutAt(currentMultiplier);
    const payout = betAmount * currentMultiplier;
    addWinnings(payout);
    addResult({ game: "Crash", bet: betAmount, multiplier: currentMultiplier, payout, won: true });
    setGameState("cashed_out");
    drawGraph(pointsRef.current, false);
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  // Draw initial empty graph
  useEffect(() => {
    drawGraph([], false);
  }, [drawGraph]);

  return (
    <div className="container max-w-4xl py-8 animate-fade-in">
      <h1 className="mb-8 text-3xl font-extrabold text-foreground">Crash</h1>

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
                disabled={gameState === "running"}
              />
              <Button variant="outline" size="sm" onClick={() => setBetAmount(Math.floor(balance / 2))} disabled={gameState === "running"}>½</Button>
              <Button variant="outline" size="sm" onClick={() => setBetAmount(Math.floor(balance))} disabled={gameState === "running"}>Max</Button>
            </div>
          </div>

          {gameState === "idle" || gameState === "crashed" || gameState === "cashed_out" ? (
            <Button className="w-full" size="lg" onClick={startGame} disabled={betAmount > balance}>
              Place Bet
            </Button>
          ) : (
            <Button className="w-full" size="lg" variant="accent" onClick={cashOut}>
              Cash Out @ {currentMultiplier.toFixed(2)}x
            </Button>
          )}

          {gameState === "crashed" && (
            <div className="text-center text-lg font-bold text-lose" style={{ animation: "shake 0.3s ease-out" }}>
              Crashed @ {crashPoint.toFixed(2)}x 💥
            </div>
          )}

          {gameState === "cashed_out" && (
            <div className="text-center text-lg font-bold text-win text-glow-green">
              Cashed out @ {cashedOutAt.toFixed(2)}x — Won {(betAmount * cashedOutAt).toFixed(2)}!
            </div>
          )}
        </div>

        <div className="relative flex flex-col items-center justify-center rounded-xl border border-border bg-card p-4">
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-10 text-5xl font-extrabold tabular-nums ${
              gameState === "crashed" ? "text-lose text-glow-red" : "text-win text-glow-green"
            }`}
          >
            {currentMultiplier.toFixed(2)}x
          </div>
          <canvas ref={canvasRef} width={500} height={350} className="mt-12 max-w-full" />
        </div>
      </div>
    </div>
  );
};

export default CrashGame;
