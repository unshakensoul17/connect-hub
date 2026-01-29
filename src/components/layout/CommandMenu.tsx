"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, FileText, Download, User, MessageCircle, LogOut } from "lucide-react";
import { api } from "@/lib/api";
import { Note, Question } from "@/types/database";

export function CommandMenu() {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [notes, setNotes] = React.useState<Note[]>([]);
    const [questions, setQuestions] = React.useState<Question[]>([]);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    React.useEffect(() => {
        if (open) {
            const loadData = async () => {
                try {
                    const [notesData, questionsData] = await Promise.all([
                        api.notes.getAll().catch(() => []),
                        api.questions.getAll().catch(() => [])
                    ]);
                    setNotes(notesData || []);
                    setQuestions(questionsData as unknown as Question[] || []);
                } catch (e) {
                    console.error("CommandMenu data load failed:", e);
                }
            };
            loadData();
        }
    }, [open]);

    const run = (command: () => void) => {
        setOpen(false);
        command();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[20vh] animate-in fade-in duration-200">
            <Command className="w-full max-w-lg bg-[#1a1a1a] rounded-xl border border-white/10 shadow-2xl overflow-hidden glass-options">
                <div className="flex items-center border-b border-white/10 px-4">
                    <Search className="w-5 h-5 text-gray-500 mr-2" />
                    <Command.Input
                        placeholder="Search notes, questions, or actions..."
                        className="w-full h-14 bg-transparent outline-none text-white placeholder:text-gray-500"
                    />
                </div>

                <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-hide">
                    <Command.Empty className="py-6 text-center text-gray-500">No results found.</Command.Empty>

                    <Command.Group heading="Navigation" className="text-xs font-bold text-gray-500 mb-2 px-2">
                        <Command.Item onSelect={() => run(() => router.push('/dashboard'))} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 aria-selected:bg-primary/20 aria-selected:text-white cursor-pointer mb-1">
                            <FileText className="w-4 h-4" /> Go to Dashboard
                        </Command.Item>
                        <Command.Item onSelect={() => run(() => router.push('/dashboard/notes'))} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 aria-selected:bg-primary/20 aria-selected:text-white cursor-pointer mb-1">
                            <Download className="w-4 h-4" /> Browse Notes
                        </Command.Item>
                        <Command.Item onSelect={() => run(() => router.push('/dashboard/questions'))} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 aria-selected:bg-primary/20 aria-selected:text-white cursor-pointer mb-1">
                            <MessageCircle className="w-4 h-4" /> Go to Forum
                        </Command.Item>
                        <Command.Item onSelect={() => run(() => router.push('/dashboard/profile'))} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 aria-selected:bg-primary/20 aria-selected:text-white cursor-pointer mb-1">
                            <User className="w-4 h-4" /> My Profile
                        </Command.Item>
                    </Command.Group>

                    <Command.Group heading="Notes" className="text-xs font-bold text-gray-500 mb-2 px-2 mt-2">
                        {notes.slice(0, 5).map(note => (
                            <Command.Item key={note.id} onSelect={() => run(() => router.push(`/dashboard/notes#${note.id}`))} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 aria-selected:bg-secondary/20 aria-selected:text-white cursor-pointer mb-1">
                                <FileText className="w-4 h-4 text-secondary" /> {note.title}
                            </Command.Item>
                        ))}
                    </Command.Group>

                    <Command.Group heading="Questions" className="text-xs font-bold text-gray-500 mb-2 px-2 mt-2">
                        {questions.slice(0, 5).map(q => (
                            <Command.Item key={q.id} onSelect={() => run(() => router.push(`/dashboard/questions/${q.id}`))} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 aria-selected:bg-secondary/20 aria-selected:text-white cursor-pointer mb-1">
                                <MessageCircle className="w-4 h-4 text-green-400" /> {q.title}
                            </Command.Item>
                        ))}
                    </Command.Group>

                </Command.List>
            </Command>
        </div>
    );
}
