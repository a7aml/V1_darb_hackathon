import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

const MEDAL = ["🥇", "🥈", "🥉"];

const rankColor = (rank) => {
  if (rank === 1) return { bg: "rgba(245,200,66,0.12)", border: "rgba(245,200,66,0.4)", text: "#b08d00" };
  if (rank === 2) return { bg: "rgba(180,180,180,0.10)", border: "rgba(180,180,180,0.3)", text: "#6b6b6b" };
  if (rank === 3) return { bg: "rgba(180,100,50,0.08)", border: "rgba(180,100,50,0.2)", text: "#a0613a" };
  return                  { bg: "transparent",           border: "transparent",           text: "#1a1917"  };
};

const Leaderboard = ({ entries }) => {
  if (!entries || entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-forest-100/60 p-6 shadow-sm">
        <h2 className="font-display text-xl text-ink-900 mb-4">Leaderboard</h2>
        <div className="text-center py-6">
          <p className="text-3xl mb-2">🏆</p>
          <p className="text-sm text-ink-400">Complete quizzes to appear on the leaderboard!</p>
          <p className="text-xs text-ink-300 mt-1">Friends leaderboard coming soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-forest-100/60 overflow-hidden shadow-sm">
      {/* header */}
      <div className="px-5 py-4 border-b border-forest-100/60 flex items-center justify-between">
        <h2 className="font-display text-xl text-ink-900">Leaderboard</h2>
        <span className="text-2xs text-ink-400 bg-cream-100 border border-cream-200 px-2.5 py-1 rounded-full">
          XP Ranking
        </span>
      </div>

      <div className="divide-y divide-forest-100/30">
        {entries.slice(0, 8).map((entry, i) => {
          const rank   = i + 1;
          const colors = rankColor(rank);
          const initials = entry.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "??";

          return (
            <motion.div
              key={entry.id || i}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0  }}
              transition={{ delay: i * 0.06, duration: 0.35, ease }}
              className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${entry.isYou ? "bg-forest-50/60" : "hover:bg-cream-50/60"}`}
            >
              {/* rank */}
              <div className="w-8 text-center shrink-0">
                {rank <= 3 ? (
                  <span className="text-xl">{MEDAL[rank - 1]}</span>
                ) : (
                  <span className="text-sm font-bold text-ink-400">#{rank}</span>
                )}
              </div>

              {/* avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border"
                style={{
                  backgroundColor: entry.isYou ? "#1a4a47" : colors.bg || "#f5f0e8",
                  borderColor: colors.border || "transparent",
                  color: entry.isYou ? "white" : colors.text,
                }}
              >
                {initials}
              </div>

              {/* name */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${entry.isYou ? "text-forest-700" : "text-ink-900"}`}>
                  {entry.name}
                  {entry.isYou && (
                    <span className="ms-2 text-2xs font-normal text-forest-500 bg-forest-50 border border-forest-100 px-1.5 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </p>
              </div>

              {/* XP */}
              <div className="shrink-0 text-end">
                <p className="text-sm font-bold text-ink-900">{entry.xp.toLocaleString()}</p>
                <p className="text-2xs text-ink-400">XP</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* coming soon footer */}
      <div className="px-5 py-3 border-t border-forest-100/40 bg-cream-50/60">
        <p className="text-2xs text-ink-400 text-center">
          🚀 Friend leaderboards coming soon — invite classmates to compete
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;