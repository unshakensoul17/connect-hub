"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ThumbsUp, MessageCircle, CheckCircle, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { Question, Answer } from "@/types/database";

export default function QuestionDetailPage() {
    const { id } = useParams();
    const [question, setQuestion] = useState<Question | null>(null);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [loading, setLoading] = useState(true);
    const [reply, setReply] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function fetchData() {
            if (!id) return;
            try {
                const data = await api.questions.getOne(id as string);
                setQuestion(data as unknown as Question);
                // Supabase join returns answers in the same object, but type might need assertion
                // Ideally we fetch answers separately to order them better if needed, but the join works for now
                // Assuming the getOne query returns answers array nested
                if ((data as any).answers) {
                    setAnswers((data as any).answers);
                }
            } catch (error) {
                console.error("Error fetching question", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    const handlePostAnswer = async () => {
        if (!reply || !question) return;

        try {
            setSubmitting(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const newAnswer = await api.questions.createAnswer({
                content: reply,
                question_id: question.id,
                author_id: user.id
            });

            // Refresh page state (optimistic update would be better but this is simple)
            window.location.reload();
        } catch (error) {
            console.error("Failed to post answer", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-secondary" /></div>;
    if (!question) return <div className="text-center py-20 text-gray-400">Question not found.</div>;

    return (
        <div className="max-w-4xl mx-auto animate-fade-in-up space-y-6">
            <Link href="/dashboard/questions" className="text-gray-400 hover:text-white flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Forum
            </Link>

            {/* Question Card */}
            <div className="glass-card p-8 border-l-4 border-l-secondary">
                <div className="flex justify-between items-start mb-4">
                    <h1 className="text-2xl font-bold text-white">{question.title}</h1>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-white/5 border border-white/10">
                        <Button variant="ghost" size="sm" className="h-6 px-1 hover:bg-transparent hover:text-secondary"><ThumbsUp className="w-4 h-4" /></Button>
                        <span className="text-sm font-bold text-white">{question.upvotes}</span>
                    </div>
                </div>

                <div className="prose prose-invert max-w-none text-gray-300 mb-6 whitespace-pre-wrap font-sans">
                    {question.content}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <div className="flex gap-2">
                        {question.tags.map(tag => (
                            <span key={tag} className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">#{tag}</span>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600" />
                        <div className="text-sm">
                            <p className="text-white font-medium">{question.author?.full_name}</p>
                            <p className="text-xs text-gray-400">{new Date(question.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Answers Section */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" /> {answers.length} Answers
                </h2>

                <div className="space-y-4">
                    {answers.map((ans) => (
                        <div key={ans.id} className={`glass-card p-6 ${ans.is_accepted ? 'border-green-500/50 bg-green-500/5' : ''}`}>
                            {ans.is_accepted && (
                                <div className="flex items-center gap-2 text-green-400 text-sm font-bold mb-3">
                                    <CheckCircle className="w-4 h-4" /> Accepted Solution
                                </div>
                            )}
                            <p className="text-gray-300 whitespace-pre-wrap mb-4">{ans.content}</p>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <span>Answered by {(ans.author as any)?.full_name || 'Senior'}</span>
                                    <span>• {new Date(ans.created_at).toLocaleDateString()}</span>
                                </div>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white gap-2">
                                    <ThumbsUp className="w-3 h-3" /> {ans.upvotes} Helpful
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Reply Box */}
                <div className="glass-card p-6 mt-8">
                    <h3 className="text-lg font-bold text-white mb-4">Post your Answer</h3>
                    <textarea
                        className="glass-input w-full min-h-[150px] mb-4"
                        placeholder="Write a helpful answer..."
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                    />
                    <div className="flex justify-end">
                        <Button
                            onClick={handlePostAnswer}
                            className="bg-primary hover:bg-primary/90 text-white gap-2"
                            disabled={submitting || !reply}
                        >
                            {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />} Post Answer
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
