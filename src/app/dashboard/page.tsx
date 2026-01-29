"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Crown, BookOpen, Star, Search } from "lucide-react";
import { Recommendations } from "@/components/dashboard/Recommendations";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function DashboardPage() {
    const [userName, setUserName] = useState("Student");

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.user_metadata?.full_name) {
                // Get the first name
                setUserName(user.user_metadata.full_name.split(' ')[0]);
            } else if (user?.email) {
                setUserName(user.email.split('@')[0]);
            }
        };
        getUser();
    }, []);

    return (
        <>
            {/* Hero Welcome */}
            <section className="glass-card p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full -mr-16 -mt-16 pointer-events-none" />

                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Good Afternoon, <span className="text-primary text-glow">{userName}!</span> 🚀
                    </h1>
                    <p className="text-gray-400 max-w-xl">
                        "Success is not final, failure is not fatal: it is the courage to continue that counts."
                    </p>

                    <div className="flex gap-4 mt-6">
                        <Link href="/dashboard/upload">
                            <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-lg shadow-primary/25">
                                <Upload className="w-4 h-4 mr-2" /> Upload Note
                            </Button>
                        </Link>
                        <Link href="/dashboard/questions">
                            <Button variant="glass" className="text-white">
                                Ask a Doubt
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Global Search Bar Placeholder - Could be more functional later */}
            <Link href="/dashboard/notes" className="relative block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search for notes, subjects, or mentors... (Press Cmd+K)"
                    className="w-full glass-input pl-12 py-4 text-lg rounded-2xl shadow-lg shadow-black/10 focus:shadow-primary/20 transition-all pointer-events-none cursor-pointer"
                    readOnly
                />
            </Link>

            <Recommendations />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Trending Notes */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Trending Notes
                        </h2>
                        <Link href="/dashboard/notes">
                            <Button variant="link" className="text-sm">View All</Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Dummy Note Cards */}
                        <NoteCard
                            title="Advanced Data Structures"
                            subject="Computer Science"
                            author="Sarah Conner"
                            rating={4.8}
                            downloads="1.2k"
                        />
                        <NoteCard
                            title="Organic Chemistry Module 3"
                            subject="Chemistry"
                            author="Walter White"
                            rating={4.9}
                            downloads="850"
                        />
                    </div>
                </div>

                {/* Top Mentors */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Crown className="w-5 h-5 text-accent" /> Top Mentors
                    </h2>
                    <div className="glass-card p-4 space-y-4">
                        <MentorRow name="Dr. Strange" role="CSE • 4th Year" points="24,500" />
                        <MentorRow name="Tony Stark" role="Mech • 3rd Year" points="18,200" />
                        <MentorRow name="Peter Parker" role="Biochem • 2nd Year" points="12,400" />
                    </div>
                </div>
            </div>
        </>
    );
}

function NoteCard({ title, subject, author, rating, downloads }: any) {
    return (
        <div className="glass-card p-5 group cursor-pointer hover:border-primary/50">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                    <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-xs font-bold bg-white/5 px-2 py-1 rounded-full text-yellow-500">
                    <Star className="w-3 h-3 fill-current" /> {rating}
                </div>
            </div>

            <h3 className="font-bold text-lg text-white mb-1 group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-sm text-gray-400 mb-4">{subject}</p>

            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-sm">
                <span className="text-gray-300">{author}</span>
                <span className="text-gray-500">{downloads} downloads</span>
            </div>
        </div>
    )
}

function MentorRow({ name, role, points }: any) {
    return (
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent to-primary" />
            <div className="flex-1">
                <h4 className="font-bold text-white text-sm">{name}</h4>
                <p className="text-xs text-gray-400">{role}</p>
            </div>
            <span className="text-xs font-mono text-primary font-bold">{points} XP</span>
        </div>
    )
}
