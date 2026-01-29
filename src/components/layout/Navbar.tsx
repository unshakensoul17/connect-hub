"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Zap, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function Navbar() {
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);

        // Check session
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();

        // Listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            if (event === 'SIGNED_IN') router.refresh();
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
            authListener.subscription.unsubscribe();
        };
    }, [router]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
                isScrolled ? "bg-background/60 backdrop-blur-xl border-white/10" : "bg-transparent"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Zap className="w-5 h-5 text-white fill-current" />
                        </div>
                        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all">
                            Campus<span className="text-primary">Connect</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/dashboard">
                                    <Button variant="ghost" size="sm">Dashboard</Button>
                                </Link>
                                <Button
                                    onClick={handleSignOut}
                                    size="sm"
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
                                >
                                    Sign Out
                                </Button>
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
                                    <User className="w-4 h-4 text-primary" />
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">Log In</Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                                        Join Now
                                    </Button>
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-white/5 text-gray-300"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-black/90 backdrop-blur-2xl border-b border-white/10 p-4 space-y-4 animate-in slide-in-from-top-4">
                    <div className="grid grid-cols-1 gap-4">
                        {user ? (
                            <>
                                <Link href="/dashboard" className="w-full">
                                    <Button variant="ghost" className="w-full">Dashboard</Button>
                                </Link>
                                <Button onClick={handleSignOut} className="w-full bg-red-500/10 text-red-500">Sign Out</Button>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <Link href="/login" className="w-full">
                                    <Button variant="ghost" className="w-full">Log In</Button>
                                </Link>
                                <Link href="/register" className="w-full">
                                    <Button className="w-full">Join Now</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors relative group"
        >
            {children}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
        </Link>
    );
}

function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="block text-base font-medium text-gray-300 hover:text-white px-2 py-2 rounded-lg hover:bg-white/5"
        >
            {children}
        </Link>
    );
}
