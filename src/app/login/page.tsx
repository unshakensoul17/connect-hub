"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;

            // Success! Navigate to dashboard (middleware will redirect if needed)
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative">
            {/* Back Button */}
            <Link href="/" className="absolute top-8 left-8 text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>

            <div className="w-full max-w-md animate-fade-in-up">
                {/* Glass Card */}
                <div className="glass-card p-8 md:p-10 border-t border-white/20">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">Welcome Back</h1>
                        <p className="text-gray-400">Enter your college credentials to access the hub.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="email"
                                    className="glass-input w-full pl-10"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="password"
                                    className="glass-input w-full pl-10"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white h-11 text-base shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                            {loading ? "Signing In..." : "Sign In"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>Don't have an account? <Link href="/register" className="text-primary hover:underline">Register as Start-up</Link></p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10">
                        <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-gray-300">
                            Continue with Google
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
