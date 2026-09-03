"use client";

import { useScoreboard } from "../hooks/useScoreboard";
import { TeamCard } from "../components/TeamCard";
import { Loader2, AlertCircle } from "lucide-react";

export default function ScoreboardPage() {
  const { teams, loading, error } = useScoreboard();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-yellow-500/30 p-8 md:p-12 lg:p-24 flex flex-col">
      <header className="mb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-600 bg-clip-text text-transparent">
          QUIZ SHOWDOWN
        </h1>
        <p className="mt-4 text-slate-400 font-mono tracking-widest uppercase">Live Leaderboard</p>
      </header>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
        </div>
      ) : teams.length === 0 ? (
        <div className="flex-grow flex items-center justify-center text-slate-500 font-mono text-xl">
          Waiting for teams to join...
        </div>
      ) : (
        <div className="flex-grow flex flex-col gap-6 max-w-5xl w-full mx-auto">
          {teams.map((team, index) => (
            <TeamCard key={team.id} team={team} rank={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
