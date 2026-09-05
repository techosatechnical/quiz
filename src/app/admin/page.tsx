"use client";

import { useState, useEffect } from "react";
import { useScoreboard, updateTeamScore, createTeam, deleteTeam, updateTeamDetails } from "../../hooks/useScoreboard";
import { ROUNDS } from "../../types/quiz";
import { Lock, LogOut, Plus, X, Trash2, Edit2, Save } from "lucide-react";
import clsx from "clsx";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const { teams, loading } = useScoreboard();
  const [selectedRound, setSelectedRound] = useState(ROUNDS[0].id);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [newTeam, setNewTeam] = useState({
    schoolName: "",
    teamCode: "",
    member1: "",
    member2: "",
    member3: "",
    captainIndex: 0
  });
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editTeamData, setEditTeamData] = useState<any>(null);

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
    } else {
      alert("Invalid password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_auth");
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.schoolName || !newTeam.teamCode || !newTeam.member1 || !newTeam.member2 || !newTeam.member3) {
      alert("Please fill all fields");
      return;
    }

    try {
      await createTeam({
        schoolName: newTeam.schoolName,
        teamCode: newTeam.teamCode,
        members: [
          { id: '1', name: newTeam.member1, isCaptain: newTeam.captainIndex === 0 },
          { id: '2', name: newTeam.member2, isCaptain: newTeam.captainIndex === 1 },
          { id: '3', name: newTeam.member3, isCaptain: newTeam.captainIndex === 2 }
        ]
      });
      setShowAddTeam(false);
      setNewTeam({ schoolName: "", teamCode: "", member1: "", member2: "", member3: "", captainIndex: 0 });
    } catch (e) {
      alert("Failed to create team.");
    }
  };

  const handleScoreUpdate = async (teamId: string, delta: number, currentScores: any, currentTotal: number, teamName: string) => {
    const action = delta >= 0 ? 'add' : 'deduct';
    if (!confirm(`Are you sure you want to ${action} ${Math.abs(delta)} points for ${teamName}?`)) {
      return;
    }
    try {
      await updateTeamScore(teamId, selectedRound, delta, currentScores, currentTotal);
    } catch (e) {
      alert("Failed to update score.");
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (confirm("Are you sure you want to delete this team? This action cannot be undone.")) {
      try {
        await deleteTeam(teamId);
      } catch (e) {
        alert("Failed to delete team.");
      }
    }
  };

  const startEditing = (team: any) => {
    setEditingTeamId(team.id);
    setEditTeamData({
      schoolName: team.schoolName,
      teamCode: team.teamCode,
    });
  };

  const saveEdit = async () => {
    if (!editingTeamId || !editTeamData.schoolName || !editTeamData.teamCode) return;
    try {
      await updateTeamDetails(editingTeamId, {
        schoolName: editTeamData.schoolName,
        teamCode: editTeamData.teamCode,
      });
      setEditingTeamId(null);
    } catch (e) {
      alert("Failed to update team details.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 p-8 rounded-xl w-full max-w-md shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-slate-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 text-center mb-6">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg transition-colors"
            >
              Enter Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  const currentRoundInfo = ROUNDS.find(r => r.id === selectedRound);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Score Control Panel</h1>
            <p className="text-slate-600 mt-1">Live database connection active</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowAddTeam(!showAddTeam)}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg text-black font-bold transition-colors"
            >
              {showAddTeam ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showAddTeam ? "Cancel" : "Add Team"}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-slate-900"
            >
              <LogOut className="w-4 h-4" /> Lock Console
            </button>
          </div>
        </header>

        {showAddTeam && (
          <div className="mb-12 bg-white border border-yellow-500/50 rounded-xl p-6 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Create New Team</h2>
            <form onSubmit={handleAddTeam} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">School Name</label>
                  <input required type="text" value={newTeam.schoolName} onChange={e => setNewTeam({...newTeam, schoolName: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900" placeholder="e.g. Springfield High" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Team Code (Short)</label>
                  <input required type="text" value={newTeam.teamCode} onChange={e => setNewTeam({...newTeam, teamCode: e.target.value.toUpperCase()})} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900" placeholder="e.g. SHS" />
                </div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((num, i) => (
                  <div key={num} className="flex gap-4 items-end">
                    <div className="flex-grow">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Member {num} Name</label>
                      <input required type="text" value={newTeam[`member${num}` as keyof typeof newTeam] as string} onChange={e => setNewTeam({...newTeam, [`member${num}`]: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900" placeholder={`Member ${num}`} />
                    </div>
                    <label className="flex items-center gap-2 mb-2 cursor-pointer text-sm text-slate-700 whitespace-nowrap">
                      <input type="radio" name="captain" checked={newTeam.captainIndex === i} onChange={() => setNewTeam({...newTeam, captainIndex: i})} className="accent-yellow-500 w-4 h-4" />
                      Captain
                    </label>
                  </div>
                ))}
              </div>
              <div className="md:col-span-2 flex justify-end mt-2">
                <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-2 rounded-lg transition-colors">
                  Create Team
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mb-12 bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-4">Select Active Round</h2>
          <div className="flex flex-wrap gap-3">
            {ROUNDS.map(round => (
              <button
                key={round.id}
                onClick={() => setSelectedRound(round.id)}
                className={clsx(
                  "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                  selectedRound === round.id
                    ? "bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
              >
                {round.id.toUpperCase()}: {round.name}
              </button>
            ))}
          </div>
          {currentRoundInfo && (
            <div className="mt-4 text-sm text-slate-600">
              Scoring Rules: <span className="text-green-600 font-mono">+{currentRoundInfo.defaultPositive}</span> / <span className="text-red-600 font-mono">{currentRoundInfo.defaultNegative}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-12">Loading teams...</div>
        ) : (
          <div className="grid gap-4">
            {teams.map(team => (
              <div key={team.id} className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="text-xl font-bold">{team.schoolName}</h3>
                  <p className="text-slate-600 font-mono text-sm">Code: {team.teamCode} | Current Total: {team.totalScore}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    Round Score: {team.roundScores[selectedRound as keyof typeof team.roundScores] || 0}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleScoreUpdate(team.id, currentRoundInfo!.defaultPositive, team.roundScores, team.totalScore, team.schoolName)}
                    className="bg-green-500/20 text-green-600 hover:bg-green-500/30 border border-green-500/50 px-4 py-2 rounded-lg font-bold min-w-[80px]"
                  >
                    +{currentRoundInfo!.defaultPositive}
                  </button>

                  {currentRoundInfo!.defaultNegative !== 0 && (
                    <button
                      onClick={() => handleScoreUpdate(team.id, currentRoundInfo!.defaultNegative, team.roundScores, team.totalScore, team.schoolName)}
                      className="bg-red-500/20 text-red-600 hover:bg-red-500/30 border border-red-500/50 px-4 py-2 rounded-lg font-bold min-w-[80px]"
                    >
                      {currentRoundInfo!.defaultNegative}
                    </button>
                  )}

                  <div className="w-px h-8 bg-slate-300 mx-2 self-center hidden sm:block"></div>

                  <button
                    onClick={() => {
                      const custom = parseInt(prompt("Enter custom score change (can be negative):") || "0", 10);
                      if (!isNaN(custom)) {
                        handleScoreUpdate(team.id, custom, team.roundScores, team.totalScore, team.schoolName);
                      }
                    }}
                    className="bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 px-4 py-2 rounded-lg font-bold"
                  >
                    Custom
                  </button>

                  <div className="w-px h-8 bg-slate-300 mx-2 self-center hidden sm:block"></div>

                  {editingTeamId === team.id ? (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={editTeamData.schoolName}
                        onChange={e => setEditTeamData({...editTeamData, schoolName: e.target.value})}
                        className="bg-white border border-slate-300 rounded px-2 text-sm w-32 text-slate-900" 
                      />
                      <input 
                        type="text" 
                        value={editTeamData.teamCode}
                        onChange={e => setEditTeamData({...editTeamData, teamCode: e.target.value})}
                        className="bg-white border border-slate-300 rounded px-2 text-sm w-16 text-slate-900" 
                      />
                      <button onClick={saveEdit} className="p-2 bg-green-500/20 text-green-600 rounded-lg hover:bg-green-500/30">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingTeamId(null)} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => startEditing(team)} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}

                  <button onClick={() => handleDeleteTeam(team.id)} className="p-2 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
