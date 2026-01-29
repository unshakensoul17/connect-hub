"use client";

import { ChatDemo } from "@/components/ChatDemo";
import { Sparkles, ArrowLeft, BookOpen, Clock, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ChatbotDemoPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Navigation */}
                <Link href="/dashboard/notes" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Notes
                </Link>

                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
                            <Sparkles className="w-3 h-3" />
                            Premium Feature Demo
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                            Chat with your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Course Notes</span>
                        </h1>
                        <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
                            Upload your PDFs and let our AI analyze them. Ask questions, get summaries, and clarify complex concepts instantly.
                        </p>

                        <div className="grid grid-cols-2 gap-4 py-6">
                            {[
                                { icon: BookOpen, title: "Deep Context", desc: "Understands full PDFs" },
                                { icon: Clock, title: "Instant Answers", desc: "No more searching" },
                                { icon: ShieldCheck, title: "Private & Secure", desc: "Your notes are safe" },
                                { icon: Zap, title: "Supercharged", desc: "Powered by Gemini 1.5" },
                            ].map((feature, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="shrink-0 w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                                        <feature.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold">{feature.title}</h4>
                                        <p className="text-[10px] text-gray-500">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Chat UI Demo */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="h-[600px] relative"
                    >
                        <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full" />
                        <ChatDemo />
                    </motion.div>
                </div>

                {/* Status Check / Why this demo? */}
                <div className="glass-card p-6 border-white/5 bg-white/[0.02]">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-8 h-8 text-yellow-500" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <h3 className="text-xl font-bold">Why am I seeing a demo?</h3>
                            <p className="text-sm text-gray-400">
                                This demo is showcase of the planned AI integration. Currently, the live chatbot requires a configured
                                <code className="mx-1 px-1.5 py-0.5 rounded bg-white/10 text-primary">GEMINI_API_KEY</code> and
                                <code className="mx-1 px-1.5 py-0.5 rounded bg-white/10 text-primary">Supabase Vector Storage</code>.
                                We've provided this demo so you can experience the UI and intended workflow.
                            </p>
                        </div>
                        <Link href="/dashboard/upload">
                            <button className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors whitespace-nowrap">
                                Try Real Upload
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
