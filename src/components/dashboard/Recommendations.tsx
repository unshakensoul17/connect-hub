"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Note, Profile } from "@/types/database";
import { supabase } from "@/lib/supabase";
import { BookOpen, Star, Sparkles, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Recommendations() {
    const [recommended, setRecommended] = useState<Note[]>([]);
    const [user, setUser] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (!authUser) return;

                const profile = await api.profiles.get(authUser.id);
                setUser(profile);

                // Basic Recommendation Logic:
                // Fetch notes that match user's department or semester
                const allNotes = await api.notes.getAll();

                const filtered = allNotes.filter(n => {
                    // Simple matching score
                    let score = 0;
                    if (profile.department && n.tags.some(t => t.toLowerCase().includes(profile.department!.toLowerCase()))) score += 2;
                    if (n.tags.some(t => t.toLowerCase().includes('recommend'))) score += 1;
                    return score > 0 || Math.random() > 0.7; // Random mix for discovery if no strict match
                }).slice(0, 3);

                setRecommended(filtered.length > 0 ? filtered : allNotes.slice(0, 3)); // Fallback to recent

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
    if (!user) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-secondary fill-current" /> Recommended for You
                </h2>
                <Link href="/dashboard/notes">
                    <Button variant="link" className="text-sm">View All</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommended.map(note => (
                    <Link key={note.id} href={`/dashboard/notes#${note.id}`}>
                        <div className="glass-card p-4 hover:border-secondary/30 group cursor-pointer h-full flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full border border-secondary/20">
                                    {note.subject}
                                </span>
                                <div className="flex items-center gap-1 text-[10px] text-yellow-500 font-bold">
                                    <Star className="w-3 h-3 fill-current" /> {note.rating_avg}
                                </div>
                            </div>

                            <h3 className="font-bold text-white mb-1 group-hover:text-secondary transition-colors line-clamp-2">{note.title}</h3>
                            <p className="text-xs text-gray-400 line-clamp-2 mb-4 flex-1">{note.description}</p>

                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto pt-3 border-t border-white/5">
                                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px]">
                                    {note.author?.full_name?.charAt(0)}
                                </div>
                                <span>{note.author?.full_name}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
