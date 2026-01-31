"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Send, Loader2, MessageCircle, Sparkles, Upload } from 'lucide-react';
import { RagApi } from '@/lib/rag-api';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    sources?: any[];
}

interface ChatWithPDFProps {
    noteId: string;
    noteTitle: string;
    fileUrl?: string; // Optional because we might need to upload manually
    isOpen: boolean;
    onClose: () => void;
}

export function ChatWithPDF({ noteId, noteTitle, fileUrl, isOpen, onClose }: ChatWithPDFProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [ingesting, setIngesting] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [documentId, setDocumentId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, ingesting, loading]);

    // Initial Ingestion Logic
    useEffect(() => {
        if (!isOpen) return;

        // Reset state on open
        setMessages([]);
        setError(null);
        setIsReady(false);
        setDocumentId(null);

        async function ingestFile() {
            if (!fileUrl) {
                // If no URL, we can't auto-ingest. User must upload.
                return;
            }

            setIngesting(true);
            try {
                // Fetch the PDF from the URL
                const response = await fetch(fileUrl);
                if (!response.ok) throw new Error("Failed to download PDF from source");

                const blob = await response.blob();
                // Add a unique suffix to avoid "Document already exists" errors
                const uniqueName = `${noteTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
                const file = new File([blob], uniqueName, { type: "application/pdf" });

                // Keep trying to ingest until it works or user cancels? 
                // For now, just try once.
                const data = await RagApi.ingestPDF(file);
                setDocumentId(data.document_id);
                setIsReady(true);
            } catch (err: any) {
                console.error("Auto-ingestion failed:", err);
                // Don't show critical error, just let user fallback to manual upload if needed
                // But since we want strict integration, maybe we should show an error or a manual upload button
                setError("Could not automatically process the file. Please upload it properly.");
            } finally {
                setIngesting(false);
            }
        }

        ingestFile();
    }, [isOpen, noteId, fileUrl, noteTitle]);

    const handleManualUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIngesting(true);
        setError(null);
        try {
            // Rename file to ensure uniqueness
            const uniqueName = `${file.name.replace(".pdf", "")}_${Date.now()}.pdf`;
            const uniqueFile = new File([file], uniqueName, { type: file.type });

            const data = await RagApi.ingestPDF(uniqueFile);
            setDocumentId(data.document_id);
            setIsReady(true);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Upload failed");
        } finally {
            setIngesting(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const data = await RagApi.query(input, documentId ? { document_id: documentId } : undefined);
            const aiMessage: Message = {
                role: 'assistant',
                content: data.answer,
                timestamp: new Date(),
                sources: data.sources
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (err: any) {
            console.error(err);
            const errorMessage: Message = {
                role: 'assistant',
                content: "Sorry, I encountered an error answering that. " + (err.message || ""),
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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

                {/* Content Area */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {ingesting ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Analyzing Document...</h3>
                            <p className="text-gray-400">Please wait while we process the PDF content.</p>
                        </div>
                    ) : !isReady ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                <Upload className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Upload PDF to Chat</h3>
                            <p className="text-gray-400 max-w-md mb-6">
                                {error
                                    ? `Error: ${error}`
                                    : "We couldn't automatically access the file. Please upload the PDF manually to start chatting."}
                            </p>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleManualUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <Button className="bg-primary text-white hover:bg-primary/90">
                                    Select PDF File
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* Chat Interface */
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.length === 0 && (
                                    <div className="text-center py-12">
                                        <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                                        <p className="text-white font-medium">Ready to chat!</p>
                                        <p className="text-sm text-gray-400">Ask any question about the document.</p>
                                    </div>
                                )}

                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {message.role === 'assistant' && (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                                                <Sparkles className="w-4 h-4 text-primary" />
                                            </div>
                                        )}
                                        <div className={`max-w-[75%] space-y-2`}>
                                            <div
                                                className={`p-3 rounded-lg ${message.role === 'user'
                                                    ? 'bg-primary text-white'
                                                    : 'bg-white/5 text-gray-200 border border-white/10'
                                                    }`}
                                            >
                                                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                                            </div>

                                            {/* Sources citation if available */}
                                            {message.sources && message.sources.length > 0 && (
                                                <div className="text-xs text-gray-500 pl-1">
                                                    <p className="font-semibold mb-1">Sources:</p>
                                                    <ul className="list-disc pl-4 space-y-1">
                                                        {message.sources.map((source: any, i: number) => (
                                                            <li key={i} className="line-clamp-1 italic">
                                                                Page {source.metadata?.page_number || '?'}: {source.content.substring(0, 50)}...
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

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

                            {/* Input Area */}
                            <div className="p-4 border-t border-white/10 bg-black/20">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Ask a question..."
                                        className="flex-1 glass-input h-10 px-4 rounded-lg bg-white/5 border-white/10 focus:border-primary/50 transition-all text-sm"
                                        disabled={loading}
                                    />
                                    <Button
                                        onClick={handleSend}
                                        disabled={loading || !input.trim()}
                                        className="bg-primary text-white hover:bg-primary/90 h-10 w-10 p-0"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
