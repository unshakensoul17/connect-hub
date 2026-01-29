"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter, BookOpen, Download, Star, Loader2, MessageCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ReviewDialog } from "@/components/ReviewDialog";
import { ChatWithPDF } from "@/components/ChatWithPDF";
import { useNotesSearch } from "@/hooks/useNotesSearch";
import { SearchHighlight } from "@/components/SearchHighlight";

export default function NotesPage() {
    const [search, setSearch] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("All");
    const [user, setUser] = useState<any>(null);

    // Use Meilisearch for search
    const { results: searchResults, loading: searchLoading, error: searchError, total, processingTime } = useNotesSearch(
        search,
        selectedSubject
    );

    // Review Dialog State
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewNoteId, setReviewNoteId] = useState<string | null>(null);
    const [reviewNoteTitle, setReviewNoteTitle] = useState<string>("");

    // Chat Dialog State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatNoteId, setChatNoteId] = useState<string | null>(null);
    const [chatNoteTitle, setChatNoteTitle] = useState<string>("");

    useEffect(() => {
        async function fetchUser() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        }
        fetchUser();
    }, []);

    const handleReview = (noteId: string, noteTitle: string) => {
        if (!user) {
            alert("Please login to write a review.");
            return;
        }
        setReviewNoteId(noteId);
        setReviewNoteTitle(noteTitle);
        setIsReviewOpen(true);
    };

    const handleReviewSuccess = async () => {
        // Refresh search results to show updated rating
        setSearch(prev => prev + " ");
        setTimeout(() => setSearch(prev => prev.trim()), 100);
    };

    const handleChat = (noteId: string, noteTitle: string) => {
        setChatNoteId(noteId);
        setChatNoteTitle(noteTitle);
        setIsChatOpen(true);
    };

    const subjects = ["All", "Computer Science", "Electronics", "Mechanical", "Civil", "Mathematics", "Physics"];


    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Notes Library</h1>
                    <p className="text-gray-400">Explore resources shared by your seniors.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/demo/chatbot">
                        <Button variant="outline" className="border-primary/50 text-white hover:bg-primary/10">
                            <Sparkles className="w-4 h-4 mr-2 text-primary" />
                            Try AI Demo
                        </Button>
                    </Link>
                    <Link href="/dashboard/upload">
                        <Button className="bg-primary text-white shadow-lg shadow-primary/25">
                            + Upload New
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by title, subject, or author... (typo-tolerant)"
                        className="w-full glass-input pl-12 h-12 rounded-xl"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {processingTime > 0 && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                            {processingTime}ms • {total} results
                        </span>
                    )}
                </div>

            </div>

            {/* Categories / Tags - Now functional filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {subjects.map((subject) => (
                    <button
                        key={subject}
                        onClick={() => setSelectedSubject(subject)}
                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-all ${subject === selectedSubject
                            ? "bg-white text-black border-white font-bold"
                            : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                            }`}
                    >
                        {subject}
                    </button>
                ))}
            </div>

            {/* Search Error */}
            {searchError && (
                <div className="glass-card p-4 border-l-4 border-red-500">
                    <p className="text-red-400">⚠️ Search error: {searchError}</p>
                    <p className="text-xs text-gray-400 mt-1">Make sure Meilisearch is running (docker-compose up -d)</p>
                </div>
            )}

            {/* Loading State */}
            {searchLoading && (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            )}

            {/* Empty State */}
            {!searchLoading && searchResults.length === 0 && (
                <div className="text-center py-20 glass-card">
                    <h3 className="text-xl font-bold text-white mb-2">No notes found!</h3>
                    <p className="text-gray-400">
                        {search ? `No results for "${search}"` : "Be the first to upload something."}
                    </p>
                </div>
            )}

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((result) => (
                    <NoteCard
                        key={result.id}
                        result={result}
                        userId={user?.id || null}
                        onReview={() => handleReview(result.id, result.title)}
                        onChat={() => handleChat(result.id, result.title)}
                    />
                ))}
            </div>

            {/* Review Dialog */}
            {user && reviewNoteId && (
                <ReviewDialog
                    noteId={reviewNoteId}
                    noteTitle={reviewNoteTitle}
                    userId={user.id}
                    isOpen={isReviewOpen}
                    onClose={() => setIsReviewOpen(false)}
                    onSuccess={handleReviewSuccess}
                />
            )}

            {/* Chat Dialog */}
            {chatNoteId && (
                <ChatWithPDF
                    noteId={chatNoteId}
                    noteTitle={chatNoteTitle}
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                />
            )}
        </div>
    );
}

function NoteCard({ result, onReview, onChat, userId }: { result: any, onReview: () => void, onChat: () => void, userId: string | null }) {
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    // Check if note is already saved on mount
    useEffect(() => {
        async function checkSavedStatus() {
            if (!userId) return;

            try {
                const response = await fetch(`/api/library?userId=${userId}`);
                const data = await response.json();

                if (data.success && data.data) {
                    const isAlreadySaved = data.data.some((item: any) => item.note?.id === result.id);
                    setIsSaved(isAlreadySaved);
                }
            } catch (error) {
                console.error('Error checking saved status:', error);
            }
        }

        checkSavedStatus();
    }, [userId, result.id]);

    const handleView = async () => {
        try {
            // Open file immediately
            window.open(result.file_url, '_blank');
            // Increment count in background
            const response = await fetch(`/api/notes/${result.id}/increment-downloads`, { method: 'POST' });
        } catch (e) {
            console.error("Failed to increment download", e);
        }
    };

    const handleSaveToLibrary = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!userId) {
            alert('Please login to save notes');
            return;
        }

        setSaving(true);
        try {
            if (isSaved) {
                // Remove from library
                const response = await fetch(`/api/library?noteId=${result.id}&userId=${userId}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    setIsSaved(false);
                }
            } else {
                // Add to library
                const response = await fetch('/api/library', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ noteId: result.id, userId }),
                });
                if (response.ok || response.status === 409) {
                    setIsSaved(true);
                }
            }
        } catch (error) {
            console.error('Error saving to library:', error);
            alert('Failed to save note');
        } finally {
            setSaving(false);
        }
    };

    // Use formatted (highlighted) results if available, otherwise use regular
    const displayTitle = result._formatted?.title || result.title;
    const displayDescription = result._formatted?.description || result.description;
    const displaySubject = result._formatted?.subject || result.subject;

    return (
        <div className="glass-card p-0 overflow-hidden group hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] bg-black/20 flex flex-col h-full">
            {/* Thumbnail / Preview Area */}
            <div className="h-40 bg-gradient-to-br from-gray-800 to-gray-900 border-b border-white/5 relative p-4 flex items-center justify-center group-hover:from-gray-800 group-hover:to-gray-800 transition-colors shrink-0">
                <BookOpen className="w-12 h-12 text-gray-600 group-hover:text-primary transition-colors duration-300 transform group-hover:scale-110" />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onReview();
                    }}
                    className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-yellow-500 flex items-center gap-1 hover:bg-yellow-500/20 transition-colors cursor-pointer"
                >
                    <Star className="w-3 h-3 fill-current" /> {result.rating_avg || 'New'}
                </button>
            </div>

            <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-xs text-primary mb-2 font-medium">
                    <span className="bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 line-clamp-1">
                        <SearchHighlight text={displaySubject} />
                    </span>
                </div>

                <h3 className="font-bold text-lg text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors" title={result.title}>
                    <SearchHighlight text={displayTitle} />
                </h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">
                    <SearchHighlight text={displayDescription} />
                </p>

                <div className="mt-auto space-y-3">
                    {/* Action Buttons Grid */}
                    <div className="grid grid-cols-3 gap-2">
                        <Button
                            onClick={handleView}
                            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-primary/50 transition-all text-xs"
                        >
                            <Download className="w-3 h-3" />
                        </Button>
                        <Button
                            onClick={handleSaveToLibrary}
                            disabled={saving || !userId}
                            className={`text-xs transition-all ${isSaved
                                ? 'bg-primary/20 border-primary text-primary hover:bg-primary/30'
                                : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                                }`}
                        >
                            {saving ? '...' : isSaved ? '✓' : '+'}
                        </Button>
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                onChat();
                            }}
                            className="bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 text-white border border-primary/30 transition-all text-xs"
                            title="Chat with PDF"
                        >
                            <MessageCircle className="w-3 h-3" />
                        </Button>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-[10px] uppercase font-bold overflow-hidden">
                                {result.author_name?.charAt(0) || '?'}
                            </div>
                            <span className="text-xs text-gray-300 line-clamp-1">{result.author_name || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                            <Download className="w-3 h-3" /> {result.downloads}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


