"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, Star, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SearchHighlight } from "@/components/SearchHighlight";
import Link from "next/link";

interface SavedNote {
    id: string;
    created_at: string;
    note: {
        id: string;
        title: string;
        description: string;
        subject: string;
        file_url: string;
        downloads: number;
        rating_avg: number;
        created_at: string;
        author: {
            full_name: string;
            role: string;
            college_id: string;
        } | null;
    };
}

export default function LibraryPage() {
    const [user, setUser] = useState<any>(null);
    const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Get user
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                if (!user) {
                    setLoading(false);
                    return;
                }

                // Fetch saved notes
                const response = await fetch(`/api/library?userId=${user.id}`);
                const data = await response.json();

                if (data.success) {
                    setSavedNotes(data.data || []);
                }
            } catch (error) {
                console.error("Error fetching library:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleRemove = async (noteId: string) => {
        if (!user) return;

        try {
            const response = await fetch(`/api/library?noteId=${noteId}&userId=${user.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setSavedNotes(prev => prev.filter(item => item.note.id !== noteId));
            }
        } catch (error) {
            console.error("Error removing note:", error);
            alert("Failed to remove note from library");
        }
    };

    const handleView = async (noteId: string, fileUrl: string) => {
        window.open(fileUrl, '_blank');
        // Increment downloads
        try {
            await fetch(`/api/notes/${noteId}/increment-downloads`, { method: 'POST' });
        } catch (e) {
            console.error("Failed to increment download", e);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="glass-card p-12 text-center">
                        <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
                        <p className="text-gray-400 mb-6">Please login to view your saved notes</p>
                        <Link href="/login">
                            <Button className="bg-primary text-white hover:bg-primary/90">
                                Go to Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        📚 My Library
                    </h1>
                    <p className="text-gray-400">
                        Your saved notes collection • {savedNotes.length} {savedNotes.length === 1 ? 'note' : 'notes'}
                    </p>
                </div>

                {/* Empty State */}
                {savedNotes.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">No Saved Notes Yet</h2>
                        <p className="text-gray-400 mb-6">
                            Start building your library by saving notes you find useful
                        </p>
                        <Link href="/dashboard/notes">
                            <Button className="bg-primary text-white hover:bg-primary/90">
                                Browse Notes
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedNotes.map((item) => (
                            <div
                                key={item.id}
                                className="glass-card p-0 overflow-hidden group hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] bg-black/20 flex flex-col h-full"
                            >
                                {/* Thumbnail */}
                                <div className="h-40 bg-gradient-to-br from-gray-800 to-gray-900 border-b border-white/5 relative p-4 flex items-center justify-center">
                                    <BookOpen className="w-12 h-12 text-gray-600 group-hover:text-primary transition-colors" />
                                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-yellow-500 flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-current" /> {item.note.rating_avg || 'New'}
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col flex-1">
                                    {/* Subject */}
                                    <div className="flex items-center gap-2 text-xs text-primary mb-2 font-medium">
                                        <span className="bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 line-clamp-1">
                                            {item.note.subject}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="font-bold text-lg text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                                        {item.note.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">
                                        {item.note.description}
                                    </p>

                                    {/* Actions */}
                                    <div className="mt-auto space-y-3">
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                onClick={() => handleView(item.note.id, item.note.file_url)}
                                                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-primary/50 transition-all text-xs"
                                            >
                                                <Download className="w-3 h-3 mr-1" /> Download
                                            </Button>
                                            <Button
                                                onClick={() => handleRemove(item.note.id)}
                                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/50 transition-all text-xs"
                                            >
                                                <Trash2 className="w-3 h-3 mr-1" /> Remove
                                            </Button>
                                        </div>

                                        {/* Author Info */}
                                        <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-[10px] uppercase font-bold">
                                                    {item.note.author?.full_name?.charAt(0) || '?'}
                                                </div>
                                                <span className="text-xs text-gray-300 line-clamp-1">
                                                    {item.note.author?.full_name || 'Anonymous'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Download className="w-3 h-3" /> {item.note.downloads}
                                            </div>
                                        </div>
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
