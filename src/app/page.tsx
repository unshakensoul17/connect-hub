import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 md:py-32 space-y-8 relative overflow-hidden">

        {/* Decorative elements behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full -z-10" />

        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-secondary animate-fade-in-up delay-100">
            Level Up Your <br />
            <span className="text-primary text-glow">Campus Life</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto animate-fade-in-up delay-200">
            Share notes, find peer mentors, and ace your exams.
            The community-driven platform for students to collaborate and shine together.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-8 animate-fade-in-up delay-300">
          <Link
            href="/login"
            className="group px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-[0_0_20px_rgba(249,115,22,0.5)] hover:shadow-[0_0_30px_rgba(249,115,22,0.8)] transition-all hover:-translate-y-1 flex items-center gap-2"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
