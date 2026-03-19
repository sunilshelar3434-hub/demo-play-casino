import { useBalance } from "@/contexts/BalanceContext";
import { Button } from "@/components/ui/button";
import { RotateCcw, Coins } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import StreakBadge from "@/components/StreakBadge";
import BigWinOverlay from "@/components/BigWinOverlay";

const TopBar = () => {
  const { displayBalance, resetBalance, balancePulse, streak, bigWin, clearBigWin, screenShake } = useBalance();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {bigWin && <BigWinOverlay amount={bigWin.amount} onDone={clearBigWin} />}
      <header
        className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl"
        style={screenShake ? { animation: "shake 0.4s ease-out" } : undefined}
      >
        <div className="container flex h-16 items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-foreground btn-press"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Coins className="h-4 w-4 text-primary-foreground" />
            </div>
            <span>NeoVegas</span>
          </button>

          <div className="flex items-center gap-3">
            <StreakBadge streak={streak} />

            <div
              className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2"
              style={balancePulse ? { animation: "pulse-balance 0.4s ease-out" } : undefined}
            >
              <Coins className="h-4 w-4 text-primary" />
              <span className="font-bold text-foreground tabular-nums">
                {displayBalance.toFixed(2)}
              </span>
            </div>

            <Button variant="outline" size="sm" onClick={resetBalance}>
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>

            {location.pathname !== "/" && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                All Games
              </Button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default TopBar;
