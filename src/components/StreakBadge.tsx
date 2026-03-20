const StreakBadge = ({ streak }: { streak: { type: "win" | "lose"; count: number } | null }) => {
  if (!streak || streak.count < 2) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
        streak.type === "win"
          ? "bg-win/20 text-win"
          : "bg-lose/20 text-lose"
      }`}
      style={{ animation: "countUp 0.3s ease-out" }}
    >
      {streak.type === "win" ? "🔥" : "💀"}
      {streak.type === "win" ? `${streak.count} Win Streak!` : `Losing Streak: ${streak.count}`}
    </div>
  );
};

export default StreakBadge;
