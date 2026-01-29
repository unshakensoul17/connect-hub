"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Profile } from "@/types/database";
import { Crown, Medal, Trophy, Loader2 } from "lucide-react";

export default function LeaderboardPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const data = await api.leaderboard.getTopUsers();
                setUsers(data || []);
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        }
        fetchLeaderboard();
    }, []);

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Crown className="w-6 h-6 text-yellow-400 fill-current" />;
            case 1: return <Medal className="w-6 h-6 text-gray-300 fill-current" />;
            case 2: return <Medal className="w-6 h-6 text-amber-700 fill-current" />;
            default: return <span className="text-gray-500 font-bold font-mono">#{index + 1}</span>;
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in-up space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">Hall of Fame</h1>
                <p className="text-gray-400">Top contributors making a difference on campus.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
                </div>
            ) : (
                <div className="space-y-4">
                    {users.map((user, index) => (
                        <div
                            key={user.id}
                            className={`flex items-center gap-4 p-4 rounded-2xl glass-card transition-all hover:scale-[1.02] ${index === 0 ? 'border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : ''}`}
                        >
                            <div className="w-12 h-12 flex items-center justify-center">
                                {getRankIcon(index)}
                            </div>

                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-lg font-bold text-white overflow-hidden">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        user.full_name?.charAt(0) || '?'
                                    )}
                                </div>
                                {index < 3 && (
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center border border-white/20">
                                        <Trophy className="w-3 h-3 text-yellow-500" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <h3 className="font-bold text-white text-lg flex items-end gap-2">
                                    {user.full_name}
                                    {user.role === 'senior' && <span className="text-[10px] uppercase bg-primary/20 text-primary px-1.5 rounded border border-primary/20">Mentor</span>}
                                </h3>
                                <p className="text-xs text-gray-500">{user.college_id} • {user.department}</p>
                            </div>

                            <div className="text-right">
                                <span className="text-2xl font-bold text-white block">{user.points}</span>
                                <span className="text-xs text-gray-400 uppercase tracking-widest">XP Points</span>
                            </div>
                        </div>
                    ))}

                    {users.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            No data yet. Upload notes or answer questions to appear here!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
