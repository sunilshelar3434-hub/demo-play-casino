import { useBalance } from "@/contexts/BalanceContext";

const GameHistory = () => {
  const { history } = useBalance();

  if (history.length === 0) return null;

  return (
    <div className="mx-auto mt-12 max-w-3xl">
      <h3 className="mb-4 text-lg font-bold text-foreground">Recent Results</h3>
      <div className="space-y-2">
        {history.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm"
          >
            <div className="flex items-center gap-3">
              <span className={`inline-block h-2 w-2 rounded-full ${r.won ? "bg-win" : "bg-lose"}`} />
              <span className="font-medium text-card-foreground">{r.game}</span>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span>Bet: {r.bet.toFixed(2)}</span>
              <span>{r.multiplier.toFixed(2)}x</span>
              <span className={r.won ? "text-win font-semibold text-glow-green" : "text-lose font-semibold text-glow-red"}>
                {r.won ? "+" : "-"}{r.won ? r.payout.toFixed(2) : r.bet.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameHistory;
