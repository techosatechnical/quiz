export interface Member {
  id: string;
  name: string;
  isCaptain: boolean;
}

export interface SchoolTeam {
  id: string;
  schoolName: string;
  teamCode: string; // e.g., "SMS", "BVM", "LHS"
  members: [Member, Member, Member]; // Strict 3-member tuple
  roundScores: {
    r1: number;
    r2: number;
    r3: number;
    r4: number;
    r5: number;
    r6: number;
  };
  totalScore: number;
  lastUpdated: number;
}

export interface RoundConfig {
  id: 'r1' | 'r2' | 'r3' | 'r4' | 'r5' | 'r6';
  name: string;
  defaultPositive: number;
  defaultNegative: number;
}

export const ROUNDS: RoundConfig[] = [
  { id: 'r1', name: 'QUICK PICK 📝', defaultPositive: 1, defaultNegative: 0 },
  { id: 'r2', name: 'PICTURE PERFECT 🖼️', defaultPositive: 2, defaultNegative: 0 },
  { id: 'r3', name: 'WATCH & LISTEN 🎬🎧', defaultPositive: 2, defaultNegative: 0 },
  { id: 'r4', name: 'INDIA ON THE MAP 🗺️🇮🇳', defaultPositive: 2, defaultNegative: 0 },
  { id: 'r5', name: 'JUMBLED INDIA 🔀🇮🇳', defaultPositive: 2, defaultNegative: 0 },
  { id: 'r6', name: 'MYSTERY BOX 🎁🔍', defaultPositive: 4, defaultNegative: 0 },
];
