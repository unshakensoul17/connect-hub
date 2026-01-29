"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Send, Loader2, MessageCircle, Sparkles } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatWithPDFProps {
    noteId: string;
    noteTitle: string;
    isOpen: boolean;
    onClose: () => void;
}

export function ChatWithPDF({ noteId, noteTitle, isOpen, onClose }: ChatWithPDFProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatReady, setChatReady] = useState(false);
    const [processing, setProcessing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Check if PDF is processed on mount
    useEffect(() => {
        async function checkStatus() {
            if (!isOpen) return;

            try {
                const response = await fetch(`/api/chat/${noteId}`);
                const data = await response.json();

                if (data.available) {
                    setChatReady(true);
                } else {
                    // Trigger processing
                    setProcessing(true);
                    const processResponse = await fetch('/api/pdf/process', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ noteId }),
                    });

                    if (processResponse.ok) {
                        setChatReady(true);
                    }
                    setProcessing(false);
                }
            } catch (error) {
                console.error('Error checking chat status:', error);
                setProcessing(false);
            }
        }

        checkStatus();
    }, [noteId, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch(`/api/chat/${noteId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    history: messages.map((m) => ({ role: m.role, content: m.content })),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get response');
            }

            const aiMessage: Message = {
                role: 'assistant',
                content: data.response,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const isConfigError = error instanceof Error && (
                error.message.includes('GEMINI_API_KEY') ||
                error.message.includes('API not configured') ||
                error.message.includes('503')
            );

            const errorMessage: Message = {
                role: 'assistant',
                content: isConfigError
                    ? "It looks like the AI service is not fully configured yet. Would you like to try our interactive demo instead?"
                    : 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const suggestedQuestions = [
        "What are the main topics covered?",
        "Can you summarize the key points?",
        "Explain this concept in simple terms",
        "What are the important formulas or definitions?",
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card max-w-4xl w-full h-[80vh] flex flex-col relative animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Chat with PDF</h2>
                            <p className="text-sm text-gray-400 truncate max-w-md">{noteTitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Processing State */}
                {processing && (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                            <p className="text-white font-medium">Processing PDF...</p>
                            <p className="text-sm text-gray-400 mt-2">This may take a moment</p>
                        </div>
                    </div>
                )}

                {/* Chat Ready */}
                {!processing && chatReady && (
                    <>
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center py-12">
                                    <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                                    <p className="text-white font-medium mb-2">Ask me anything about this PDF!</p>
                                    <p className="text-sm text-gray-400 mb-6">Try one of these questions:</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto">
                                        {suggestedQuestions.map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setInput(q)}
                                                className="text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 hover:text-white transition-colors border border-white/5"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {message.role === 'assistant' && (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                                                <Sparkles className="w-4 h-4 text-primary" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[70%] p-3 rounded-lg ${message.role === 'user'
                                                ? 'bg-primary text-white'
                                                : 'bg-white/5 text-gray-200 border border-white/10'
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap text-sm">{message.content}</p>

                                            {message.role === 'assistant' && message.content.includes('interactive demo') && (
                                                <div className="mt-3">
                                                    <a
                                                        href="/demo/chatbot"
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 border border-primary/40 rounded-md text-xs font-bold text-primary transition-colors"
                                                    >
                                                        <Sparkles className="w-3 h-3" />
                                                        Launch Interactive Demo
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                            {loading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                        <p className="text-sm text-gray-400">Thinking...</p>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask a question about this PDF..."
                                    className="flex-1 glass-input"
                                    disabled={loading}
                                />
                                <Button
                                    onClick={handleSend}
                                    disabled={loading || !input.trim()}
                                    className="bg-primary text-white hover:bg-primary/90"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
