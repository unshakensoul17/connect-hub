"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageCircle, CheckCircle, Loader2, Send, Award } from "lucide-react";
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
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Vote states
    const [userQuestionVote, setUserQuestionVote] = useState<'up' | 'down' | null>(null);
    const [userAnswerVotes, setUserAnswerVotes] = useState<Record<string, 'up' | 'down' | null>>({});
    const [votingInProgress, setVotingInProgress] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            if (!id) return;
            try {
                // Get current user
                const { data: { user } } = await supabase.auth.getUser();
                setCurrentUserId(user?.id || null);

                // Fetch question and answers
                const data = await api.questions.getOne(id as string);
                setQuestion(data as unknown as Question);

                if ((data as any).answers) {
                    const answersData = (data as any).answers;
                    // Sort answers: accepted first, then by upvotes
                    const sortedAnswers = answersData.sort((a: Answer, b: Answer) => {
                        if (a.is_accepted && !b.is_accepted) return -1;
                        if (!a.is_accepted && b.is_accepted) return 1;
                        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
                    });
                    setAnswers(sortedAnswers);
                }

                // Fetch user's votes if logged in
                if (user) {
                    const questionVote = await api.questions.getUserQuestionVote(id as string, user.id);
                    setUserQuestionVote(questionVote);

                    if ((data as any).answers) {
                        const answerVotesMap: Record<string, 'up' | 'down' | null> = {};
                        for (const answer of (data as any).answers) {
                            const answerVote = await api.questions.getUserAnswerVote(answer.id, user.id);
                            answerVotesMap[answer.id] = answerVote;
                        }
                        setUserAnswerVotes(answerVotesMap);
                    }
                }
            } catch (error) {
                console.error("Error fetching question", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    const handleVoteQuestion = async (voteType: 'up' | 'down') => {
        if (!currentUserId || !question) return;

        setVotingInProgress('question');
        try {
            const result = await api.questions.voteQuestion(question.id, currentUserId, voteType);

            // Update local state
            setUserQuestionVote(result.voteType);

            // Update vote counts optimistically
            setQuestion(prev => {
                if (!prev) return prev;
                let newUpvotes = prev.upvotes;
                let newDownvotes = prev.downvotes;

                if (result.action === 'created') {
                    if (voteType === 'up') newUpvotes++;
                    else newDownvotes++;
                } else if (result.action === 'removed') {
                    if (userQuestionVote === 'up') newUpvotes--;
                    else if (userQuestionVote === 'down') newDownvotes--;
                } else if (result.action === 'updated') {
                    if (userQuestionVote === 'up') newUpvotes--;
                    if (userQuestionVote === 'down') newDownvotes--;
                    if (voteType === 'up') newUpvotes++;
                    else newDownvotes++;
                }

                return { ...prev, upvotes: newUpvotes, downvotes: newDownvotes };
            });
        } catch (error) {
            console.error("Failed to vote", error);
        } finally {
            setVotingInProgress(null);
        }
    };

    const handleVoteAnswer = async (answerId: string, voteType: 'up' | 'down') => {
        if (!currentUserId) return;

        setVotingInProgress(answerId);
        try {
            const result = await api.questions.voteAnswer(answerId, currentUserId, voteType);

            // Update local state
            setUserAnswerVotes(prev => ({ ...prev, [answerId]: result.voteType }));

            // Update vote counts optimistically
            setAnswers(prev => prev.map(answer => {
                if (answer.id !== answerId) return answer;

                let newUpvotes = answer.upvotes;
                let newDownvotes = answer.downvotes;
                const currentVote = userAnswerVotes[answerId];

                if (result.action === 'created') {
                    if (voteType === 'up') newUpvotes++;
                    else newDownvotes++;
                } else if (result.action === 'removed') {
                    if (currentVote === 'up') newUpvotes--;
                    else if (currentVote === 'down') newDownvotes--;
                } else if (result.action === 'updated') {
                    if (currentVote === 'up') newUpvotes--;
                    if (currentVote === 'down') newDownvotes--;
                    if (voteType === 'up') newUpvotes++;
                    else newDownvotes++;
                }

                return { ...answer, upvotes: newUpvotes, downvotes: newDownvotes };
            }));
        } catch (error) {
            console.error("Failed to vote", error);
        } finally {
            setVotingInProgress(null);
        }
    };

    const handleMarkAsSolved = async (answerId: string) => {
        if (!currentUserId || !question) return;

        try {
            await api.questions.markAsSolved(question.id, answerId, currentUserId);

            // Update local state
            setQuestion(prev => prev ? { ...prev, is_solved: true } : prev);
            setAnswers(prev => prev.map(answer => ({
                ...answer,
                is_accepted: answer.id === answerId
            })));
        } catch (error) {
            console.error("Failed to mark as solved", error);
            alert(error instanceof Error ? error.message : "Failed to mark as solved");
        }
    };

    const handlePostAnswer = async () => {
        if (!reply || !question || !currentUserId) return;

        try {
            setSubmitting(true);

            const newAnswer = await api.questions.createAnswer({
                content: reply,
                question_id: question.id,
                author_id: currentUserId
            });

            // Add answer to local state
            setAnswers(prev => [...prev, newAnswer as Answer]);
            setReply("");
        } catch (error) {
            console.error("Failed to post answer", error);
            alert("Failed to post answer. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-secondary w-8 h-8" /></div>;
    if (!question) return <div className="text-center py-20 text-gray-400">Question not found.</div>;

    const netVotes = question.upvotes - question.downvotes;

    return (
        <div className="max-w-4xl mx-auto animate-fade-in-up space-y-6">
            <Link href="/dashboard/questions" className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Forum
            </Link>

            {/* Question Card */}
            <div className="glass-card p-8 border-l-4 border-l-secondary">
                <div className="flex gap-6">
                    {/* Vote Section */}
                    <div className="flex flex-col items-center gap-2 pt-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVoteQuestion('up')}
                            disabled={!currentUserId || votingInProgress === 'question'}
                            className={`h-8 w-8 p-0 hover:bg-primary/10 ${userQuestionVote === 'up' ? 'text-primary bg-primary/10' : 'text-gray-400'}`}
                        >
                            <ThumbsUp className="w-5 h-5" />
                        </Button>
                        <span className={`text-lg font-bold ${netVotes > 0 ? 'text-primary' : netVotes < 0 ? 'text-red-400' : 'text-white'}`}>
                            {netVotes}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVoteQuestion('down')}
                            disabled={!currentUserId || votingInProgress === 'question'}
                            className={`h-8 w-8 p-0 hover:bg-red-500/10 ${userQuestionVote === 'down' ? 'text-red-400 bg-red-500/10' : 'text-gray-400'}`}
                        >
                            <ThumbsDown className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                            <h1 className="text-2xl font-bold text-white">{question.title}</h1>
                            {question.is_solved && (
                                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                                    <CheckCircle className="w-3 h-3" /> SOLVED
                                </span>
                            )}
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
                </div>
            </div>

            {/* Answers Section */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" /> {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
                </h2>

                <div className="space-y-4">
                    {answers.map((ans) => {
                        const answerNetVotes = ans.upvotes - ans.downvotes;
                        const userVote = userAnswerVotes[ans.id];

                        return (
                            <div key={ans.id} className={`glass-card p-6 ${ans.is_accepted ? 'border-2 border-green-500/50 bg-green-500/5' : ''}`}>
                                {ans.is_accepted && (
                                    <div className="flex items-center gap-2 text-green-400 text-sm font-bold mb-3">
                                        <Award className="w-4 h-4" /> Accepted Solution
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    {/* Vote Section */}
                                    <div className="flex flex-col items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleVoteAnswer(ans.id, 'up')}
                                            disabled={!currentUserId || votingInProgress === ans.id}
                                            className={`h-7 w-7 p-0 hover:bg-primary/10 ${userVote === 'up' ? 'text-primary bg-primary/10' : 'text-gray-400'}`}
                                        >
                                            <ThumbsUp className="w-4 h-4" />
                                        </Button>
                                        <span className={`text-base font-bold ${answerNetVotes > 0 ? 'text-primary' : answerNetVotes < 0 ? 'text-red-400' : 'text-white'}`}>
                                            {answerNetVotes}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleVoteAnswer(ans.id, 'down')}
                                            disabled={!currentUserId || votingInProgress === ans.id}
                                            className={`h-7 w-7 p-0 hover:bg-red-500/10 ${userVote === 'down' ? 'text-red-400 bg-red-500/10' : 'text-gray-400'}`}
                                        >
                                            <ThumbsDown className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <p className="text-gray-300 whitespace-pre-wrap mb-4">{ans.content}</p>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <span>Answered by {(ans.author as any)?.full_name || 'Senior'}</span>
                                                <span>• {new Date(ans.created_at).toLocaleDateString()}</span>
                                            </div>
                                            {!ans.is_accepted && !question.is_solved && currentUserId === question.author_id && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleMarkAsSolved(ans.id)}
                                                    className="text-green-400 border-green-400/20 hover:bg-green-400/10 gap-2"
                                                >
                                                    <CheckCircle className="w-3 h-3" /> Mark as Solution
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Reply Box */}
                {currentUserId && (
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
                )}

                {!currentUserId && (
                    <div className="glass-card p-6 mt-8 text-center">
                        <p className="text-gray-400">Please <Link href="/login" className="text-primary hover:underline">log in</Link> to post an answer.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
