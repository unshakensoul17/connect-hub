"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Camera, User, Book, Hash } from "lucide-react";

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        nickname: "",
        collegeId: "",
        bio: "",
        department: "",
        semester: ""
    });

    const [loading, setLoading] = useState(false);

    const handleComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error("Not authenticated. Please login again.");
            }

            // Validate required fields
            if (!formData.department || !formData.semester) {
                alert("Please fill in both Department and Semester to complete your profile.");
                setLoading(false);
                return;
            }

            // Update profile (trigger should have created it during registration)
            const { data, error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    full_name: formData.nickname || user.user_metadata.full_name || user.email!.split('@')[0],
                    department: formData.department,
                    semester: parseInt(formData.semester) || undefined,
                    college_id: formData.collegeId,
                    role: 'student', // Default role
                    points: 0 // Default points
                })
                .select()
                .single();

            if (error) {
                console.error("Failed to update profile:", error);

                // If profile doesn't exist, show helpful error
                if (error.code === 'PGRST116') {
                    throw new Error("Profile not found. Please contact support or try registering again.");
                }

                throw new Error(`Failed to update profile: ${error.message}`);
            }

            console.log("Profile updated successfully:", data);

            // Success - redirect to dashboard
            router.push("/dashboard");
            router.refresh();
        } catch (error: any) {
            console.error("Onboarding error:", error);
            alert(error.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-2xl animate-fade-in-up">

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-sm font-medium text-gray-400 mb-2">
                        <span>Setup Profile</span>
                        <span>{step}/2</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
                            style={{ width: `${(step / 2) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="glass-card p-8 md:p-10 border-t border-white/20">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">Let's Get to Know You</h1>
                        <p className="text-gray-400">Complete your profile to find relevant notes and mentors.</p>
                    </div>

                    <form onSubmit={handleComplete} className="space-y-6">

                        {step === 1 && (
                            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                                {/* Avatar Upload */}
                                <div className="flex flex-col items-center">
                                    <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative group cursor-pointer overflow-hidden transition-all hover:border-primary/50">
                                        <User className="w-8 h-8 text-gray-400 group-hover:opacity-0 transition-opacity" />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 mt-2">Upload Profile Photo</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-300 uppercase tracking-wider ml-1">Do You Go By?</label>
                                        <input
                                            type="text"
                                            className="glass-input w-full"
                                            placeholder="Nickname (Optional)"
                                            value={formData.nickname}
                                            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-300 uppercase tracking-wider ml-1">College / Institute</label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <select
                                                className="glass-input w-full pl-10 [&>option]:text-black"
                                                value={formData.collegeId}
                                                onChange={(e) => setFormData({ ...formData, collegeId: e.target.value })}
                                            >
                                                <option value="" disabled>Select Your College</option>
                                                <option value="IITbombay-3432">IIT Bombay (IITB)</option>
                                                <option value="NIT-Trichy">NIT Trichy</option>
                                                <option value="DUIET-2024">DUIET Dibrugarh</option>
                                                <option value="BITS-Pilani">BITS Pilani</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-300 uppercase tracking-wider ml-1">Bio</label>
                                    <textarea
                                        className="glass-input w-full min-h-[100px] resize-none"
                                        placeholder="Tell us about your interests, hobbies, or what you're looking for..."
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-300 uppercase tracking-wider ml-1">Department</label>
                                        <select
                                            className="glass-input w-full [&>option]:text-black"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        >
                                            <option value="" disabled>Select Department</option>
                                            <option value="cse">Computer Science</option>
                                            <option value="ece">Electronics & Comm</option>
                                            <option value="mech">Mechanical Eng</option>
                                            <option value="civil">Civil Eng</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-300 uppercase tracking-wider ml-1">Current Semester</label>
                                        <select
                                            className="glass-input w-full [&>option]:text-black"
                                            value={formData.semester}
                                            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                        >
                                            <option value="" disabled>Select Semester</option>
                                            <option value="1">1st Semester</option>
                                            <option value="2">2nd Semester</option>
                                            <option value="3">3rd Semester</option>
                                            <option value="4">4th Semester</option>
                                            <option value="5">5th Semester</option>
                                            <option value="6">6th Semester</option>
                                            <option value="7">7th Semester</option>
                                            <option value="8">8th Semester</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-300 uppercase tracking-wider ml-1">Interested Subjects</label>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 min-h-[100px] flex flex-wrap gap-2 text-sm text-gray-400">
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/20">Data Structures <button type="button" className="hover:text-white">×</button></div>
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary border border-secondary/20">Algorithms <button type="button" className="hover:text-white">×</button></div>
                                        <span className="self-center italic opacity-50">Select from list below...</span>
                                    </div>
                                    {/* Mock Subject Picker */}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {["Web Dev", "AI/ML", "Networking", "OS", "DBMS"].map(sub => (
                                            <button key={sub} type="button" className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs text-gray-300 transition-colors border border-white/5">
                                                + {sub}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            {step > 1 && (
                                <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white">
                                    Back
                                </Button>
                            )}
                            {step < 2 ? (
                                <Button type="button" onClick={() => setStep(step + 1)} className="flex-1 bg-gradient-to-r from-primary to-secondary text-white">
                                    Next Step
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={!formData.department || !formData.semester || loading}
                                    className="flex-1 bg-gradient-to-r from-primary to-secondary text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Saving..." : "Complete Profile"}
                                </Button>
                            )}
                        </div>
                    </form>
                </div >
            </div >
        </div >
    );
}
