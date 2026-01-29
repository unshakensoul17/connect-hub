"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { Profile, Note, Question } from "@/types/database";
import { Loader2, User, Book, MessageCircle, Edit, Settings, Download, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        notesCount: 0,
        questionsCount: 0,
        xpPoints: 0,
    });
    const [recentNotes, setRecentNotes] = useState<any[]>([]);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push('/login');
                    return;
                }

                // Fetch profile
                const profileData = await api.profiles.get(user.id);
                setProfile(profileData);

                // Fetch user's notes count
                const { count: notesCount } = await supabase
                    .from('notes')
                    .select('*', { count: 'exact', head: true })
                    .eq('author_id', user.id);

                // Fetch user's questions count
                const { count: questionsCount } = await supabase
                    .from('questions')
                    .select('*', { count: 'exact', head: true })
                    .eq('author_id', user.id);

                // Fetch recent notes for activity
                const { data: notes } = await supabase
                    .from('notes')
                    .select('*')
                    .eq('author_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                setStats({
                    notesCount: notesCount || 0,
                    questionsCount: questionsCount || 0,
                    xpPoints: profileData.points || 0,
                });

                setRecentNotes(notes || []);

            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [router]);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;
    if (!profile) return <div className="text-center py-20">Profile not found.</div>;

    return (
        <div className="max-w-4xl mx-auto animate-fade-in-up space-y-6">

            {/* Header Card */}
            <div className="glass-card p-8 bg-black/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 to-secondary/20" />

                <div className="relative flex flex-col md:flex-row items-end gap-6 pt-16 px-4">
                    <div className="w-32 h-32 rounded-full border-4 border-black bg-gray-800 flex items-center justify-center overflow-hidden">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-12 h-12 text-gray-500" />
                        )}
                    </div>

                    <div className="flex-1 mb-2">
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            {profile.full_name}
                            {profile.role === 'senior' && <span className="px-2 py-1 rounded text-xs bg-primary text-white uppercase font-bold tracking-wider">Senior Mentor</span>}
                        </h1>
                        <p className="text-gray-400 text-lg">{profile.department} • Semester {profile.semester}</p>
                    </div>

                    <div className="flex gap-3 mb-2">
                        <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white">
                            <Edit className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white">
                            <Settings className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-6 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors">
                    <span className="text-4xl font-bold text-primary mb-1">{stats.xpPoints}</span>
                    <span className="text-sm text-gray-400 uppercase tracking-widest font-medium">XP Points</span>
                </div>
                <div className="glass-card p-6 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors">
                    <span className="text-4xl font-bold text-secondary mb-1">{stats.notesCount}</span>
                    <span className="text-sm text-gray-400 uppercase tracking-widest font-medium">Notes Uploaded</span>
                </div>
                <div className="glass-card p-6 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors">
                    <span className="text-4xl font-bold text-white mb-1">{stats.questionsCount}</span>
                    <span className="text-sm text-gray-400 uppercase tracking-widest font-medium">Questions Asked</span>
                </div>
            </div>

            {/* Activity Section */}
            <div className="glass-card p-8">
                <h2 className="text-xl font-bold text-white mb-4">My Activity</h2>
                <div className="border-b border-white/10 flex gap-6 mb-6">
                    <button className="pb-3 border-b-2 border-primary text-white font-medium">Recent Uploads</button>
                    <button className="pb-3 border-b-2 border-transparent text-gray-400 hover:text-white">Bookmarks</button>
                </div>

                {recentNotes.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 bg-white/5 rounded-xl border border-white/5 border-dashed">
                        No recent activity found.
                        <div className="mt-4">
                            <Link href="/dashboard/upload">
                                <Button variant="link" className="text-primary">Upload your first note</Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentNotes.map((note) => (
                            <div key={note.id} className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                                    <Book className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-white truncate">{note.title}</h3>
                                    <p className="text-sm text-gray-400 truncate">{note.subject}</p>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-400 shrink-0">
                                    <div className="flex items-center gap-1">
                                        <Download className="w-4 h-4" />
                                        {note.downloads}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4" />
                                        {note.rating_avg || 0}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
