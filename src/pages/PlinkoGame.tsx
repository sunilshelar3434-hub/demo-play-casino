import { useState, useRef, useEffect, useCallback } from "react";
import { useBalance } from "@/contexts/BalanceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { playClick, playWin, playLose, playReveal } from "@/lib/sounds";

const ROWS = 12;
const PINS_PER_ROW = (row: number) => row + 3;

const RISK_MULTIPLIERS: Record<string, number[]> = {
  low: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
  medium: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
  high: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
};

// Simplified plinko using a simulated path
const PlinkoGame = () => {
  const { balance, placeBet, addWinnings, addResult } = useBalance();
  const [betAmount, setBetAmount] = useState(10);
  const [risk, setRisk] = useState<"low" | "medium" | "high">("medium");
  const [dropping, setDropping] = useState(false);
  const [ballPath, setBallPath] = useState<{ x: number; y: number }[]>([]);
  const [ballPos, setBallPos] = useState<{ x: number; y: number } | null>(null);
  const [landedIndex, setLandedIndex] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const multipliers = RISK_MULTIPLIERS[risk];
  const bucketCount = multipliers.length;

  const drawBoard = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, currentBall?: { x: number; y: number } | null, highlightBucket?: number | null) => {
    ctx.clearRect(0, 0, w, h);

    const rowSpacing = h / (ROWS + 2);
    const startY = rowSpacing;

    // Draw pins
    for (let row = 0; row < ROWS; row++) {
      const pins = row + 3;
      const pinSpacing = w / (pins + 1);
      for (let pin = 0; pin < pins; pin++) {
        const x = pinSpacing * (pin + 1);
        const y = startY + row * rowSpacing;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "hsl(217, 33%, 35%)";
        ctx.fill();
      }
    }

    // Draw buckets
    const bucketWidth = w / bucketCount;
    const bucketY = h - 30;
    for (let i = 0; i < bucketCount; i++) {
      const bx = i * bucketWidth;
      const isHighlighted = highlightBucket === i;
      const mult = multipliers[i];
      const isGood = mult >= 2;
      const isBad = mult < 1;

      ctx.fillStyle = isHighlighted
        ? isGood ? "hsl(160, 84%, 39%)" : isBad ? "hsl(0, 84%, 60%)" : "hsl(217, 91%, 60%)"
        : "hsl(217, 33%, 20%)";
      ctx.fillRect(bx + 2, bucketY, bucketWidth - 4, 26);
      ctx.fillStyle = "hsl(210, 40%, 98%)";
      ctx.font = "bold 10px Inter";
      ctx.textAlign = "center";
      ctx.fillText(`${mult}x`, bx + bucketWidth / 2, bucketY + 17);
    }

    // Draw ball
    if (currentBall) {
      ctx.beginPath();
      ctx.arc(currentBall.x, currentBall.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = "hsl(160, 84%, 39%)";
      ctx.fill();
      ctx.shadowColor = "hsl(160, 84%, 39%)";
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }, [multipliers, bucketCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    drawBoard(ctx, w, h, ballPos, landedIndex);
  }, [drawBoard, ballPos, landedIndex]);

  const drop = () => {
    if (dropping) return;
    if (!placeBet(betAmount)) return;
    playClick();

    setDropping(true);
    setLandedIndex(null);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const rowSpacing = h / (ROWS + 2);

    // Simulate path
    let position = bucketCount / 2; // Start center-ish
    const path: { x: number; y: number }[] = [];
    const startX = w / 2;
    path.push({ x: startX, y: 0 });

    for (let row = 0; row < ROWS; row++) {
      const goRight = Math.random() > 0.5;
      position += goRight ? 0.5 : -0.5;
      position = Math.max(0, Math.min(bucketCount - 1, position));

      const pins = row + 3;
      const pinSpacing = w / (pins + 1);
      const x = pinSpacing * (Math.floor(position) + 1) + (Math.random() * 10 - 5);
      const y = rowSpacing + row * rowSpacing;
      path.push({ x, y });
    }

    const finalBucket = Math.round(Math.max(0, Math.min(bucketCount - 1, position)));
    const bucketWidth = w / bucketCount;
    path.push({ x: finalBucket * bucketWidth + bucketWidth / 2, y: h - 30 });

    // Animate
    let step = 0;
    const animate = () => {
      if (step < path.length) {
        setBallPos(path[step]);
        step++;
        animFrameRef.current = requestAnimationFrame(() => {
          setTimeout(animate, 80);
        });
      } else {
        setLandedIndex(finalBucket);
        const mult = multipliers[finalBucket];
        const payout = betAmount * mult;
        const isWin = mult >= 1;
        if (payout > 0) addWinnings(payout);
        addResult({ game: "Plinko", bet: betAmount, multiplier: mult, payout: isWin ? payout : 0, won: isWin });
        setTimeout(() => {
          setBallPos(null);
          setDropping(false);
        }, 800);
      }
    };
    animate();
  };

  return (
    <div className="container max-w-4xl py-8 animate-fade-in">
      <h1 className="mb-8 text-3xl font-extrabold text-foreground">Plinko</h1>

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
              />
              <Button variant="outline" size="sm" onClick={() => setBetAmount(Math.floor(balance / 2))}>½</Button>
              <Button variant="outline" size="sm" onClick={() => setBetAmount(Math.floor(balance))}>Max</Button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Risk Level</label>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((r) => (
                <Button
                  key={r}
                  variant={risk === r ? "default" : "outline"}
                  size="sm"
                  className="flex-1 capitalize"
                  onClick={() => setRisk(r)}
                >
                  {r}
                </Button>
              ))}
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={drop} disabled={dropping || betAmount > balance}>
            {dropping ? "Dropping..." : "Drop Ball"}
          </Button>

          {landedIndex !== null && (
            <div className={`mt-2 text-center text-lg font-bold ${multipliers[landedIndex] >= 1 ? "text-win" : "text-lose"}`}>
              {multipliers[landedIndex]}x — {multipliers[landedIndex] >= 1 ? `Won ${(betAmount * multipliers[landedIndex]).toFixed(2)}!` : "Lost!"}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center rounded-xl border border-border bg-card p-4">
          <canvas
            ref={canvasRef}
            width={400}
            height={500}
            className="max-w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default PlinkoGame;
