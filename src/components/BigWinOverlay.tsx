import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
  delay: number;
}

const COLORS = [
  "hsl(160, 84%, 39%)",
  "hsl(217, 91%, 60%)",
  "hsl(45, 93%, 58%)",
  "hsl(280, 87%, 65%)",
  "hsl(0, 84%, 60%)",
];

const BigWinOverlay = ({ amount, onDone }: { amount: number; onDone: () => void }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const confetti: ConfettiPiece[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 1,
      delay: Math.random() * 0.5,
    }));
    setPieces(confetti);

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* Flash */}
      <div
        className="absolute inset-0 bg-primary/10"
        style={{ animation: "bigWinFlash 0.6s ease-out forwards" }}
      />

      {/* Confetti */}
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
            animation: `confettiFall 2s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}

      {/* Big Win Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="text-center"
          style={{ animation: "bigWinPop 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards" }}
        >
          <div className="text-6xl font-extrabold text-primary text-glow-green md:text-8xl">
            BIG WIN!
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground md:text-3xl">
            +{amount.toFixed(2)} credits
          </div>
        </div>
      </div>

      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes bigWinFlash {
          0% { opacity: 0.8; }
          100% { opacity: 0; }
        }
        @keyframes bigWinPop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default BigWinOverlay;
