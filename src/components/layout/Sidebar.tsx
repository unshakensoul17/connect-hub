"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    MessageCircle,
    Bookmark,
    Trophy,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: BookOpen, label: "Notes Library", href: "/dashboard/notes" },
    { icon: MessageCircle, label: "Q&A Forum", href: "/dashboard/questions" },
    { icon: Bookmark, label: "My Library", href: "/dashboard/library" },
    { icon: Trophy, label: "Leaderboard", href: "/dashboard/leaderboard" },
    { icon: User, label: "My Profile", href: "/dashboard/profile" },
];

export function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "hidden md:flex flex-col h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300 border-r border-white/10 bg-black/20 backdrop-blur-md",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <div className="flex items-center justify-end p-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-gray-400 hover:text-white"
                >
                    {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
                </Button>
            </div>

            <nav className="flex-1 px-3 space-y-2 py-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
                                isActive
                                    ? "bg-primary/20 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "group-hover:text-primary transition-colors")} />
                            {!isCollapsed && (
                                <span className="font-medium animate-in fade-in slide-in-from-left-2 duration-200">
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10">
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 justify-start",
                        isCollapsed && "justify-center px-0"
                    )}
                >
                    <LogOut className="w-5 h-5" />
                    {!isCollapsed && <span className="ml-3">Log Out</span>}
                </Button>
            </div>
        </aside>
    );
}
