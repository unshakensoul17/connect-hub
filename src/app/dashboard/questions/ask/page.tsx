"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AskQuestionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        tags: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content) return;

        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            await api.questions.create({
                title: formData.title,
                content: formData.content,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                author_id: user.id
            });

            router.push('/dashboard/questions');
        } catch (error) {
            console.error("Failed to post question", error);
            alert("Failed to post question. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in-up">
            <Link href="/dashboard/questions" className="text-gray-400 hover:text-white flex items-center gap-2 mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Forum
            </Link>

            <div className="glass-card p-8">
                <h1 className="text-2xl font-bold text-white mb-6">Ask a Question</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Title</label>
                        <input
                            type="text"
                            className="glass-input w-full font-bold"
                            placeholder="e.g. How to implement Debouncing in React?"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 ml-1">Keep it specific and concise.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Details</label>
                        <textarea
                            className="glass-input w-full min-h-[200px]"
                            placeholder="Describe your problem in detail..."
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Tags</label>
                        <input
                            type="text"
                            className="glass-input w-full"
                            placeholder="e.g. react, javascript, frontend"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-secondary hover:bg-secondary/90 text-white h-11"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : "Post Question"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
