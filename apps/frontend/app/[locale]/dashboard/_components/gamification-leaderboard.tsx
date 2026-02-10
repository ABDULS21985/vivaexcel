"use client";

import { useState } from "react";
import { useLeaderboard } from "@/hooks/use-gamification";
import { useAuth } from "@/providers/auth-provider";
import { Skeleton } from "@ktblog/ui/components";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@ktblog/ui/components";
import { Trophy, Medal, Crown, Users } from "lucide-react";
import { motion } from "framer-motion";

const PERIOD_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "all_time", label: "All Time" },
];

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-orange-400" />;
  return null;
}

function getRankBg(rank: number) {
  if (rank === 1) return "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800/30";
  if (rank === 2) return "bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700/30";
  if (rank === 3) return "bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800/30";
  return "";
}

export function GamificationLeaderboard() {
  const [period, setPeriod] = useState("all_time");
  const { user } = useAuth();
  const { data: leaderboard, isLoading, error, refetch } = useLeaderboard(period, undefined, 50);

  const items = leaderboard?.items ?? [];
  const top3 = items.slice(0, 3);
  const rest = items.slice(3);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <div className="flex justify-center gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <Users className="h-8 w-8 mx-auto text-[var(--muted-foreground)] mb-2" />
        <p className="text-sm text-[var(--muted-foreground)] mb-3">
          Failed to load leaderboard
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-sm text-[var(--primary)] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Filter */}
      <div className="flex gap-2">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setPeriod(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              period === opt.value
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--surface-1)] text-[var(--muted-foreground)] hover:bg-[var(--surface-2)]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-center">
          <Trophy className="h-8 w-8 mx-auto text-[var(--muted-foreground)] mb-2" />
          <p className="text-sm text-[var(--muted-foreground)]">
            No leaderboard data available for this period
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {top3.length > 0 && (
            <div className="flex justify-center items-end gap-3 px-4">
              {/* 2nd Place */}
              {top3[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`flex flex-col items-center p-4 rounded-xl border ${getRankBg(2)} w-28`}
                >
                  <Medal className="h-6 w-6 text-gray-400 mb-2" />
                  {top3[1].userAvatar ? (
                    <img
                      src={top3[1].userAvatar}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover mb-2"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold mb-2">
                      2
                    </div>
                  )}
                  <p className="text-xs font-semibold text-[var(--foreground)] truncate w-full text-center">
                    {top3[1].userName}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] tabular-nums">
                    {top3[1].score.toLocaleString()} XP
                  </p>
                </motion.div>
              )}

              {/* 1st Place */}
              {top3[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col items-center p-4 rounded-xl border ${getRankBg(1)} w-32`}
                >
                  <Crown className="h-7 w-7 text-yellow-500 mb-2" />
                  {top3[0].userAvatar ? (
                    <img
                      src={top3[0].userAvatar}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover mb-2 ring-2 ring-yellow-400"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-lg font-bold text-yellow-700 dark:text-yellow-400 mb-2">
                      1
                    </div>
                  )}
                  <p className="text-sm font-bold text-[var(--foreground)] truncate w-full text-center">
                    {top3[0].userName}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] tabular-nums">
                    {top3[0].score.toLocaleString()} XP
                  </p>
                </motion.div>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`flex flex-col items-center p-4 rounded-xl border ${getRankBg(3)} w-28`}
                >
                  <Medal className="h-6 w-6 text-orange-400 mb-2" />
                  {top3[2].userAvatar ? (
                    <img
                      src={top3[2].userAvatar}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover mb-2"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-sm font-bold mb-2">
                      3
                    </div>
                  )}
                  <p className="text-xs font-semibold text-[var(--foreground)] truncate w-full text-center">
                    {top3[2].userName}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] tabular-nums">
                    {top3[2].score.toLocaleString()} XP
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {/* Full Rankings Table */}
          {rest.length > 0 && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">XP Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rest.map((entry) => {
                    const isCurrentUser = entry.userId === user?.id;
                    return (
                      <TableRow
                        key={entry.userId}
                        className={isCurrentUser ? "bg-[var(--primary)]/5" : ""}
                      >
                        <TableCell className="font-medium tabular-nums">
                          <div className="flex items-center gap-1">
                            {getRankIcon(entry.rank)}
                            <span>{entry.rank}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {entry.userAvatar ? (
                              <img
                                src={entry.userAvatar}
                                alt=""
                                className="w-7 h-7 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-xs font-semibold">
                                {entry.userName?.[0] || "?"}
                              </div>
                            )}
                            <span className={`text-sm ${isCurrentUser ? "font-semibold text-[var(--primary)]" : "text-[var(--foreground)]"}`}>
                              {entry.userName}
                              {isCurrentUser && " (You)"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
                          {entry.score.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
