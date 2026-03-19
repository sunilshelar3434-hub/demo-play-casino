import { useState, useRef, useEffect, useCallback } from "react";
import { useBalance } from "@/contexts/BalanceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { playClick, playWin, playLose, playCrash, playCashOut } from "@/lib/sounds";

// Fake player names
const FAKE_NAMES = [
  "CryptoKing", "LuckyAce", "DiamondHands", "MoonShot", "HighRoller",
  "BetMaster", "NeonWolf", "GoldRush", "RiskTaker", "JackpotJoe",
  "SilverFox", "BlazeRunner", "StarDust", "IronBet", "PhantomX",
];

interface FakePlayer {
  name: string;
  bet: number;
  cashedOut: number | null;
  cashOutAt: number;
}

const CrashGame = () => {
  const { balance, placeBet, addWinnings, addResult, screenShake } = useBalance();
  const [betAmount, setBetAmount] = useState(10);
  const [autoCashOut, setAutoCashOut] = useState(0); // 0 = disabled
  const [gameState, setGameState] = useState<"idle" | "running" | "crashed" | "cashed_out">("idle");
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(0);
  const [cashedOutAt, setCashedOutAt] = useState(0);
  const [fakePlayers, setFakePlayers] = useState<FakePlayer[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<number[]>([]);
  const currentMultRef = useRef(1.0);
  const autoCashOutRef = useRef(0);
  const gameStateRef = useRef<"idle" | "running" | "crashed" | "cashed_out">("idle");

  const generateCrashPoint = () => {
    const r = Math.random();
    if (r < 0.03) return 1.0;
    return +(1 / (1 - r)).toFixed(2);
  };

  const generateFakePlayers = useCallback((cp: number) => {
    const count = 4 + Math.floor(Math.random() * 5);
    return Array.from({ length: count }, () => {
      const name = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
      const bet = Math.floor(5 + Math.random() * 200);
      // Most cash out before crash, some don't
      const cashOutAt = Math.random() < 0.3
        ? cp + 0.5 + Math.random() * 2 // Won't make it
        : 1.1 + Math.random() * (cp - 1.1) * 0.9; // Cash out before crash
      return { name, bet, cashedOut: null, cashOutAt };
    });
  }, []);

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
    const maxGrid = Math.max(5, Math.ceil(Math.max(...points, 2)));
    for (let i = 1; i <= 5; i++) {
      const val = (maxGrid / 5) * i;
      const y = h - (i / 5) * h * 0.85 - h * 0.05;
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(w, y);
      ctx.stroke();
      ctx.fillStyle = "hsl(215, 25%, 43%)";
      ctx.font = "11px Inter";
      ctx.textAlign = "right";
      ctx.fillText(`${val.toFixed(1)}x`, 35, y + 4);
    }

    if (points.length < 2) return;

    const maxMult = Math.max(...points, 2);
    const xStep = (w - 40) / Math.max(points.length - 1, 1);

    // Smooth curve using quadratic bezier
    ctx.beginPath();
    ctx.moveTo(40, h - h * 0.05);

    for (let i = 0; i < points.length; i++) {
      const x = 40 + i * xStep;
      const y = h - ((points[i] - 1) / (maxMult - 1 + 0.5)) * h * 0.8 - h * 0.05;
      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        const prevX = 40 + (i - 1) * xStep;
        const prevY = h - ((points[i - 1] - 1) / (maxMult - 1 + 0.5)) * h * 0.8 - h * 0.05;
        const cpx = (prevX + x) / 2;
        ctx.quadraticCurveTo(prevX, prevY, cpx, (prevY + y) / 2);
        if (i === points.length - 1) ctx.lineTo(x, y);
      }
    }

    const gradient = ctx.createLinearGradient(0, h, 0, 0);
    if (crashed) {
      gradient.addColorStop(0, "hsl(0, 84%, 60%, 0.02)");
      gradient.addColorStop(1, "hsl(0, 84%, 60%, 0.15)");
      ctx.strokeStyle = "hsl(0, 84%, 60%)";
    } else {
      gradient.addColorStop(0, "hsl(160, 84%, 39%, 0.02)");
      gradient.addColorStop(1, "hsl(160, 84%, 39%, 0.15)");
      ctx.strokeStyle = "hsl(160, 84%, 39%)";
    }
    ctx.lineWidth = 3;
    ctx.stroke();

    // Fill
    const lastIdx = points.length - 1;
    const lastX = 40 + lastIdx * xStep;
    ctx.lineTo(lastX, h - h * 0.05);
    ctx.lineTo(40, h - h * 0.05);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Glow dot at tip
    if (!crashed && points.length > 0) {
      const tipX = lastX;
      const tipY = h - ((points[lastIdx] - 1) / (maxMult - 1 + 0.5)) * h * 0.8 - h * 0.05;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "hsl(160, 84%, 39%)";
      ctx.shadowColor = "hsl(160, 84%, 39%)";
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }, []);

  const startGame = () => {
    if (!placeBet(betAmount)) return;
    playClick();

    const cp = generateCrashPoint();
    setCrashPoint(cp);
    setCurrentMultiplier(1.0);
    currentMultRef.current = 1.0;
    setCashedOutAt(0);
    setGameState("running");
    pointsRef.current = [1.0];

    const players = generateFakePlayers(cp);
    setFakePlayers(players);

    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const mult = +(1 + elapsed * 0.5 + elapsed * elapsed * 0.05).toFixed(2);
      currentMultRef.current = mult;

      // Update fake players
      setFakePlayers((prev) =>
        prev.map((p) =>
          p.cashedOut === null && mult >= p.cashOutAt
            ? { ...p, cashedOut: Math.min(p.cashOutAt, cp) }
            : p
        )
      );

      // Auto cash out
      if (autoCashOut > 0 && mult >= autoCashOut && gameState === "running") {
        cashOutInternal(mult);
        return;
      }

      if (mult >= cp) {
        setCurrentMultiplier(cp);
        pointsRef.current.push(cp);
        drawGraph(pointsRef.current, true);
        setGameState("crashed");
        playCrash();
        addResult({ game: "Crash", bet: betAmount, multiplier: 0, payout: 0, won: false });
        clearInterval(intervalRef.current);
      } else {
        setCurrentMultiplier(mult);
        pointsRef.current.push(mult);
        drawGraph(pointsRef.current, false);
      }
    }, 50);
  };

  const cashOutInternal = useCallback((mult: number) => {
    clearInterval(intervalRef.current);
    setCashedOutAt(mult);
    playCashOut();
    const payout = betAmount * mult;
    addWinnings(payout);
    addResult({ game: "Crash", bet: betAmount, multiplier: mult, payout, won: true });
    setGameState("cashed_out");
    drawGraph(pointsRef.current, false);
  }, [betAmount, addWinnings, addResult, drawGraph]);

  const cashOut = () => {
    if (gameState !== "running") return;
    cashOutInternal(currentMultRef.current);
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    drawGraph([], false);
  }, [drawGraph]);

  const isHighMult = currentMultiplier >= 3;

  return (
    <div
      className="container max-w-4xl py-8 animate-fade-in"
      style={screenShake ? { animation: "shake 0.4s ease-out" } : undefined}
    >
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

          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">
              Auto Cash Out {autoCashOut > 0 ? `(${autoCashOut}x)` : "(off)"}
            </label>
            <Input
              type="number"
              min={0}
              step={0.5}
              value={autoCashOut}
              onChange={(e) => setAutoCashOut(Math.max(0, Number(e.target.value)))}
              placeholder="0 = disabled"
              className="bg-secondary text-foreground"
              disabled={gameState === "running"}
            />
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
            <div className="text-center" style={{ animation: "shake 0.3s ease-out" }}>
              <div className="text-lg font-bold text-lose">
                Crashed @ {crashPoint.toFixed(2)}x 💥
              </div>
              {/* Near-miss: show how close they were */}
              {cashedOutAt === 0 && crashPoint > 1.5 && (
                <div className="mt-1 text-sm text-muted-foreground">
                  You could have cashed out at {(crashPoint - 0.01).toFixed(2)}x...
                </div>
              )}
            </div>
          )}

          {gameState === "cashed_out" && (
            <div className="text-center text-lg font-bold text-win text-glow-green" style={{ animation: "countUp 0.3s ease-out" }}>
              Cashed out @ {cashedOutAt.toFixed(2)}x — Won {(betAmount * cashedOutAt).toFixed(2)}!
            </div>
          )}

          {/* Fake players panel */}
          {fakePlayers.length > 0 && (gameState === "running" || gameState === "crashed" || gameState === "cashed_out") && (
            <div className="mt-2 space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Players</div>
              <div className="max-h-32 space-y-0.5 overflow-y-auto rounded-lg bg-secondary/50 p-2">
                {fakePlayers.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{p.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{p.bet.toFixed(0)}</span>
                      {p.cashedOut !== null ? (
                        <span className="font-medium text-win">
                          {p.cashedOut < crashPoint ? `${p.cashedOut.toFixed(2)}x ✓` : "💥"}
                        </span>
                      ) : gameState === "crashed" ? (
                        <span className="font-medium text-lose">💥</span>
                      ) : (
                        <span className="text-muted-foreground">...</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative flex flex-col items-center justify-center rounded-xl border border-border bg-card p-4">
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-10 text-5xl font-extrabold tabular-nums transition-all duration-150 ${
              gameState === "crashed"
                ? "text-lose text-glow-red"
                : isHighMult
                ? "text-primary text-glow-green"
                : "text-win text-glow-green"
            }`}
            style={isHighMult && gameState === "running" ? { animation: "pulse-balance 0.8s ease-in-out infinite" } : gameState === "crashed" ? { animation: "shake 0.4s ease-out" } : undefined}
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
