import { useBalance } from "@/contexts/BalanceContext";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Coins, RotateCcw, Wallet, Menu, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import StreakBadge from "@/components/StreakBadge";
import BigWinOverlay from "@/components/BigWinOverlay";
import WalletDropdown from "@/components/WalletDropdown";
import NotificationBell from "@/components/NotificationBell";
import { useNavigate } from "react-router-dom";

const TopNavbar = () => {
  const { displayBalance, resetBalance, balancePulse, streak, bigWin, clearBigWin, screenShake } = useBalance();
  const { user, profile, signOut } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [walletOpen, setWalletOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  return (
    <>
      {bigWin && <BigWinOverlay amount={bigWin.amount} onDone={clearBigWin} />}
      <header
        className="sticky top-0 z-50 border-b border-border glass"
        style={screenShake ? { animation: "shake 0.4s ease-out" } : undefined}
      >
        <div className="flex h-14 items-center justify-between px-4 gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <button onClick={() => navigate("/")} className="flex items-center gap-2 btn-press">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Coins className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-foreground hidden sm:inline">NeoVegas</span>
            </button>
          </div>

          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search games..." className="pl-9 bg-secondary border-border h-9 text-sm" />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <StreakBadge streak={streak} />

            <div
              className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5"
              style={balancePulse ? { animation: "pulse-balance 0.4s ease-out" } : undefined}
            >
              <Coins className="h-3.5 w-3.5 text-primary" />
              <span className="font-bold text-foreground tabular-nums text-sm">{displayBalance.toFixed(2)}</span>
            </div>

            <NotificationBell />

            <div className="relative">
              <Button variant="outline" size="sm" onClick={() => setWalletOpen(!walletOpen)} className="gap-1.5">
                <Wallet className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Wallet</span>
              </Button>
              {walletOpen && <WalletDropdown onClose={() => setWalletOpen(false)} />}
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{profile?.username || "Profile"}</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => navigate("/auth")} className="gap-1.5">
                <LogIn className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={resetBalance} className="gap-1.5 hidden sm:flex">
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </header>
    </>
  );
};

export default TopNavbar;
