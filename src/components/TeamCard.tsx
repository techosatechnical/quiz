import { motion } from 'framer-motion';
import { Trophy, Star, User } from 'lucide-react';
import { SchoolTeam } from '../types/quiz';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface TeamCardProps {
  team: SchoolTeam;
  rank: number;
}

export function TeamCard({ team, rank }: TeamCardProps) {
  // Styling based on rank
  const rankColors = [
    'from-yellow-400 to-yellow-600 border-yellow-500 text-yellow-900', // 1st - Gold
    'from-slate-300 to-slate-500 border-slate-400 text-slate-900',     // 2nd - Silver
    'from-amber-600 to-amber-800 border-amber-700 text-amber-50',      // 3rd - Bronze
  ];

  const bgGradient = rank <= 3 ? rankColors[rank - 1] : 'from-slate-800 to-slate-900 border-slate-700 text-slate-200';
  const isTopThree = rank <= 3;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        "relative rounded-xl border-2 p-6 shadow-xl overflow-hidden flex flex-col md:flex-row items-center gap-6 bg-gradient-to-br",
        bgGradient
      )}
    >
      {/* Rank Indicator */}
      <div className="flex-shrink-0 w-16 h-16 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-sm border border-white/10">
        {rank === 1 ? (
          <Trophy className="w-8 h-8 text-yellow-100 drop-shadow-md" />
        ) : (
          <span className="text-3xl font-bold font-mono">#{rank}</span>
        )}
      </div>

      {/* Team Info */}
      <div className="flex-grow text-center md:text-left space-y-1">
        <h2 className="text-3xl font-black uppercase tracking-wider">{team.schoolName}</h2>
        <p className={cn("text-sm font-semibold tracking-widest", isTopThree ? 'text-black/60' : 'text-slate-400')}>
          TEAM CODE: {team.teamCode}
        </p>

        {/* Members */}
        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
          {team.members.map((member) => (
            <div
              key={member.id}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border",
                member.isCaptain
                  ? (isTopThree ? 'bg-black/20 border-black/10' : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200')
                  : (isTopThree ? 'bg-black/5 border-black/5' : 'bg-white/5 border-white/10 text-slate-300')
              )}
            >
              {member.isCaptain ? <Star className="w-4 h-4" /> : <User className="w-4 h-4" />}
              {member.name}
            </div>
          ))}
        </div>
      </div>

      {/* Score */}
      <div className="flex-shrink-0 text-center bg-black/20 rounded-2xl p-4 min-w-[140px] border border-white/10 backdrop-blur-sm">
        <p className="text-xs font-bold tracking-widest uppercase mb-1 opacity-80">Total Score</p>
        <p className="text-5xl font-black font-mono tabular-nums">{team.totalScore}</p>
      </div>
    </motion.div>
  );
}
