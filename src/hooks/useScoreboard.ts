import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SchoolTeam, ROUNDS } from '../types/quiz';

const CACHE_KEY = 'quiz_scoreboard_cache';

export function useScoreboard() {
  const [teams, setTeams] = useState<SchoolTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage first for immediate display (offline resilience)
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        setTeams(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached teams", e);
      }
    }

    // Set up Firestore realtime listener
    const q = query(collection(db, 'teams'), orderBy('totalScore', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedTeams: SchoolTeam[] = [];
      snapshot.forEach((doc) => {
        updatedTeams.push({ id: doc.id, ...doc.data() } as SchoolTeam);
      });
      
      setTeams(updatedTeams);
      setLoading(false);
      setError(null);
      
      // Update cache
      localStorage.setItem(CACHE_KEY, JSON.stringify(updatedTeams));
    }, (err) => {
      console.error("Firestore listener error:", err);
      setError("Failed to sync with live data. Showing cached offline data if available.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { teams, loading, error };
}

// Admin function to update scores
export async function updateTeamScore(teamId: string, roundId: string, scoreDelta: number, currentScores: SchoolTeam['roundScores'], currentTotal: number) {
  const teamRef = doc(db, 'teams', teamId);
  const newRoundScore = (currentScores[roundId as keyof SchoolTeam['roundScores']] || 0) + scoreDelta;
  const newTotalScore = currentTotal + scoreDelta;

  try {
    await setDoc(teamRef, {
      roundScores: {
        ...currentScores,
        [roundId]: newRoundScore
      },
      totalScore: newTotalScore,
      lastUpdated: Date.now()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating score:", error);
    throw error;
  }
}

// Admin function to create a new team
export async function createTeam(teamData: Omit<SchoolTeam, 'id' | 'roundScores' | 'totalScore' | 'lastUpdated'>) {
  const newTeamRef = doc(collection(db, 'teams'));
  const newTeam: SchoolTeam = {
    ...teamData,
    id: newTeamRef.id,
    roundScores: { r1: 0, r2: 0, r3: 0, r4: 0, r5: 0, r6: 0 },
    totalScore: 0,
    lastUpdated: Date.now()
  };

  try {
    await setDoc(newTeamRef, newTeam);
    return newTeam;
  } catch (error) {
    console.error("Error creating team:", error);
    throw error;
  }
}

// Admin function to delete a team
export async function deleteTeam(teamId: string) {
  const { deleteDoc } = await import('firebase/firestore');
  const teamRef = doc(db, 'teams', teamId);
  try {
    await deleteDoc(teamRef);
    return true;
  } catch (error) {
    console.error("Error deleting team:", error);
    throw error;
  }
}

// Admin function to update team details (school, code, members)
export async function updateTeamDetails(teamId: string, teamData: Partial<SchoolTeam>) {
  const teamRef = doc(db, 'teams', teamId);
  try {
    await setDoc(teamRef, { ...teamData, lastUpdated: Date.now() }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating team:", error);
    throw error;
  }
}
