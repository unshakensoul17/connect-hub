"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, MessageCircle, Plus, ThumbsUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Question } from "@/types/database";

export default function QuestionsPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function fetchQuestions() {
            try {
                const data = await api.questions.getAll();
                setQuestions((data as unknown as Question[]) || []);
            } catch (error) {
                console.error("Failed to fetch questions:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchQuestions();
    }, []);

    const filteredQuestions = questions.filter(q =>
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.content.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Doubt Forum</h1>
                    <p className="text-gray-400">Stuck? Ask your seniors and get expert help.</p>
                </div>
                <Link href="/dashboard/questions/ask">
                    <Button className="bg-secondary text-white shadow-lg shadow-secondary/25">
                        <Plus className="w-4 h-4 mr-2" /> Ask Doubt
                    </Button>
                </Link>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search questions..."
                    className="w-full glass-input pl-12 h-12 rounded-xl"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading && (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-secondary" />
                </div>
            )}

            {!loading && filteredQuestions.length === 0 && (
                <div className="text-center py-20 glass-card">
                    <h3 className="text-xl font-bold text-white mb-2">No questions yet!</h3>
                    <p className="text-gray-400">Be the first to start a discussion.</p>
                </div>
            )}

            <div className="space-y-4">
                {filteredQuestions.map((q) => (
                    <Link href={`/dashboard/questions/${q.id}`} key={q.id}>
                        <div className="glass-card p-6 hover:border-secondary/50 group transition-all">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        {q.is_solved && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">SOLVED</span>
                                        )}
                                        <h3 className="font-bold text-lg text-white group-hover:text-secondary transition-colors">{q.title}</h3>
                                    </div>
                                    <p className="text-gray-400 line-clamp-2 text-sm">{q.content}</p>

                                    <div className="flex items-center gap-3 pt-2">
                                        <div className="flex gap-2">
                                            {q.tags.slice(0, 3).map(tag => (
                                                <span key={tag} className="text-xs px-2 py-1 rounded bg-white/5 text-gray-400">#{tag}</span>
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-500">• Posted by {q.author?.full_name || 'Anonymous'}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2 text-gray-400">
                                    <div className="flex items-center gap-1 text-sm">
                                        <ThumbsUp className="w-4 h-4" /> {q.upvotes}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm">
                                        <MessageCircle className="w-4 h-4" /> {Array.isArray(q.answers) ? q.answers.length : (q as any).answers?.[0]?.count || 0}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
