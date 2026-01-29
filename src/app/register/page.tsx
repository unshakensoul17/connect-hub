"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Lock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    // Default role is now just 'student' internally, or handled by DB default
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [otp, setOtp] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Sign up user
            const { data, error: signupError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: `${formData.firstName} ${formData.lastName}`,
                        role: 'student' // Default role for everyone
                    }
                }
            });

            if (signupError) throw signupError;

            // If signup successful, we show OTP input if verification required
            if (data.session) {
                // Wait for the trigger to create the profile (2s to ensure completion)
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Profile is now created via DB Trigger
                router.push('/onboarding');
            } else {
                setShowOtpInput(true);
            }
        } catch (err: any) {
            setError(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerifying(true);
        setError("");

        try {
            const { data, error: verifyError } = await supabase.auth.verifyOtp({
                email: formData.email,
                token: otp,
                type: 'signup'
            });

            if (verifyError) throw verifyError;

            if (data.user || data.session) {
                // Profile is created by DB trigger automatically
                router.push('/onboarding');
            }
        } catch (err: any) {
            setError(err.message || "Invalid OTP");
        } finally {
            setVerifying(false);
        }
    };

    if (showOtpInput) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
                <div className="w-full max-w-md animate-fade-in-up">
                    <div className="glass-card p-8 md:p-10 border-t border-white/20">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">Verify Email</h1>
                            <p className="text-gray-400">Enter the code sent to {formData.email}</p>
                        </div>

                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-300 uppercase tracking-wider ml-1">OTP Code</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        className="glass-input w-full pl-10 tracking-widest text-center font-bold text-lg"
                                        placeholder="123456"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <Button disabled={verifying} className="w-full bg-primary hover:bg-primary/90 text-white h-11">
                                {verifying ? "Verifying..." : "Confirm & Login"}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
            <Link href="/" className="absolute top-8 left-8 text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>

            <div className="w-full max-w-md animate-fade-in-up">
                <div className="glass-card p-8 md:p-10 border-t border-white/20">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">Join the Squad</h1>
                        <p className="text-gray-400">Create your account to start sharing.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-300 uppercase tracking-wider ml-1">First Name</label>
                                <input
                                    type="text"
                                    className="glass-input w-full"
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-300 uppercase tracking-wider ml-1">Last Name</label>
                                <input
                                    type="text"
                                    className="glass-input w-full"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-300 uppercase tracking-wider ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="email"
                                    className="glass-input w-full pl-10"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-300 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="password"
                                    className="glass-input w-full pl-10"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <Button disabled={loading} className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white h-11 text-base mt-2">
                            {loading ? "Creating Account..." : "Create Account"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>Already have an account? <Link href="/login" className="text-primary hover:underline">Sign In</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
