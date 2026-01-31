"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Send, Loader2, MessageCircle, Sparkles, User, Bot, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const MOCK_DATA = {
    title: "Introduction to Quantum Computing.pdf",
    description: "Lecture notes covering qubits, superposition, entanglement, and basic quantum algorithms like Deutsch-Jozsa.",
    suggestions: [
        "What is a qubit?",
        "Explain entanglement simply",
        "How is it different from classical computing?",
        "What are the main applications?"
    ],
    responses: [
        {
            keywords: ["qubit", "what is"],
            response: "A qubit (quantum bit) is the basic unit of quantum information. Unlike a classical bit which is either 0 or 1, a qubit can exist in a superposition of both states simultaneously, thanks to quantum mechanics."
        },
        {
            keywords: ["entanglement"],
            response: "Quantum entanglement is a phenomenon where two or more particles become connected such that the state of one instantly influences the state of the others, regardless of the distance between them. Einstein famously called this 'spooky action at a distance'."
        },
        {
            keywords: ["classical", "different", "difference"],
            response: "Classical computers use bits (0 or 1) and process information linearly. Quantum computers use qubits and leverage superposition and interference to perform complex calculations in parallel, making them exponentially faster for specific problems like factorization."
        },
        {
            keywords: ["application", "use case"],
            response: "Main applications include: \n1. Cryptography (breaking RSA encryption)\n2. Drug discovery (simulating molecular structures)\n3. Financial modeling\n4. Optimization problems in logistics"
        }
    ],
    defaultResponse: "That's a great question about these notes! In a real environment, I would search through the specific text of the PDF to give you a detailed answer. For this demo, try asking about 'qubits', 'entanglement', or 'applications'."
};

export function ChatDemo() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hi! I'm your AI Study Assistant. I've analyzed 'Introduction to Quantum Computing.pdf'. Ask me anything about it!",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSend = async (text: string = input) => {
        const query = text.trim();
        if (!query || loading) return;

        const userMessage: Message = {
            role: 'user',
            content: query,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        // Simulate AI thinking
        setTimeout(() => {
            let responseText = MOCK_DATA.defaultResponse;

            const lowerQuery = query.toLowerCase();
            for (const item of MOCK_DATA.responses) {
                if (item.keywords.some(k => lowerQuery.includes(k))) {
                    responseText = item.response;
                    break;
                }
            }

            const aiMessage: Message = {
                role: 'assistant',
                content: responseText,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full glass-card border-white/10 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                        <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold leading-none">AI Study Tutor</h3>
                        <p className="text-[10px] text-primary mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                            DEMO MODE ACTIVE
                        </p>
                    </div>
                </div>
                <div className="hidden sm:block text-right">
                    <p className="text-xs text-gray-400">Context:</p>
                    <p className="text-xs text-white font-medium truncate max-w-[150px]">{MOCK_DATA.title}</p>
                </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                <AnimatePresence initial={false}>
                    {messages.map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {m.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm ${m.role === 'user'
                                    ? 'bg-primary text-white ml-12 rounded-tr-none'
                                    : 'bg-white/5 text-gray-200 border border-white/10 mr-12 rounded-tl-none'
                                    }`}
                            >
                                <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                                <p className={`text-[10px] mt-2 opacity-50 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            {m.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0 border border-white/10">
                                    <User className="w-4 h-4 text-gray-300" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length < 3 && !loading && (
                <div className="px-4 pb-2">
                    <p className="text-[10px] text-gray-500 mb-2 font-medium uppercase tracking-wider">Suggested Questions</p>
                    <div className="flex flex-wrap gap-2">
                        {MOCK_DATA.suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(s)}
                                className="text-xs py-1.5 px-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/15 hover:border-primary/50 transition-all cursor-pointer"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-4 bg-white/5 border-t border-white/10">
                <div className="relative group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your message..."
                        className="w-full glass-input pr-12 h-12 rounded-xl border-white/10 focus:border-primary/50 transition-all"
                        disabled={loading}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={loading || !input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white disabled:opacity-50 disabled:bg-gray-700 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-[10px] text-gray-500 text-center mt-3 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3 text-yellow-500/50" />
                    This is a demo based on mock data. AI analysis is simulated here.
                </p>
            </div>
        </div>
    );
}
