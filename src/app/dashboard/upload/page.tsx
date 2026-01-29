"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { uploadFile } from "@/lib/upload";

export default function UploadNotePage() {
    const router = useRouter();
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        subject: "Data Structures",
        semester: "3rd Semester",
        tags: ""
    });

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !formData.title) return;

        try {
            setLoading(true);

            // 1. Get current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                throw new Error("Not authenticated. Please login again.");
            }

            // 2. Verify user has a profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, role, college_id')
                .eq('id', user.id)
                .single();

            if (profileError || !profile) {
                console.error("Profile error:", profileError);
                throw new Error("Profile not found. Please complete your onboarding.");
            }

            // 3. Upload file to Storage using utility
            let publicUrl;
            try {
                console.log("Uploading file to storage...");
                const result = await uploadFile(file, 'notes-files', user.id);
                publicUrl = result.publicUrl;
                console.log("File uploaded successfully:", publicUrl);
            } catch (storageError: any) {
                console.error("Storage upload failed:", storageError);
                // Check for common storage errors
                if (storageError.statusCode === '404' || storageError.message?.includes('Bucket not found')) {
                    throw new Error("Storage bucket not found. Please run the setup_database.sql script.");
                }
                throw new Error(`File upload failed: ${storageError.message || JSON.stringify(storageError)}`);
            }

            // 4. Create Note Entry in DB
            try {
                console.log("Creating database entry...");
                await api.notes.create({
                    title: formData.title,
                    description: formData.description,
                    subject: formData.subject,
                    file_url: publicUrl,
                    tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                    is_public: true,
                    author_id: user.id,
                    college_id: profile.college_id // Auto-tag with college
                });
                console.log("Note created successfully");
            } catch (dbError: any) {
                console.error("Database insert failed:", dbError);
                throw new Error(`Failed to save note details: ${dbError.message || JSON.stringify(dbError)}`);
            }

            // Success - redirect to notes page
            router.push('/dashboard/notes');
            router.refresh();

        } catch (error: any) {
            console.error("Upload process failed:", error);

            // Provide user-friendly error messages
            const errorMessage = error.message || "An unexpected error occurred.";

            // Show alert with specific error
            alert(`Upload Failed: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in-up">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Upload Resources</h1>
                <p className="text-gray-400">Share your knowledge with juniors. Earn points for every download.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-6">
                        <div
                            className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${dragActive ? "border-primary bg-primary/10" : "border-white/20 hover:border-white/40 hover:bg-white/5"
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleChange}
                                accept=".pdf,.doc,.docx,.ppt,.pptx"
                                disabled={loading}
                            />

                            {file ? (
                                <div className="flex flex-col items-center animate-in zoom-in duration-200">
                                    <div className="w-16 h-16 rounded-xl bg-secondary/20 flex items-center justify-center mb-4 text-secondary">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <p className="font-medium text-white mb-1">{file.name}</p>
                                    <p className="text-xs text-gray-500 mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 z-10"
                                        onClick={(e) => {
                                            e.preventDefault(); // Prevent opening file dialog
                                            setFile(null);
                                        }}
                                    >
                                        Remove File
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                                        <UploadCloud className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="font-medium text-white mb-1">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-500">PDF, PPT, or DOC (Max 10MB)</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="glass-card p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-300 uppercase tracking-wider ml-1">Title</label>
                            <input
                                type="text"
                                className="glass-input w-full"
                                placeholder="e.g. Unit 1: Introduction to Algorithms"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-300 uppercase tracking-wider ml-1">Description</label>
                            <textarea
                                className="glass-input w-full min-h-[80px] resize-none"
                                placeholder="Brief summary of what this note covers..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-300 uppercase tracking-wider ml-1">Subject</label>
                                <select
                                    className="glass-input w-full [&>option]:text-black"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                >
                                    <option>Data Structures</option>
                                    <option>Algorithms</option>
                                    <option>Web Dev</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-300 uppercase tracking-wider ml-1">Semester</label>
                                <select className="glass-input w-full [&>option]:text-black">
                                    <option>3rd Semester</option>
                                    <option>4th Semester</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-300 uppercase tracking-wider ml-1">Tags</label>
                            <input
                                type="text"
                                className="glass-input w-full"
                                placeholder="Separate with commas (e.g. notes, exam-prep, summary)"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            />
                        </div>

                        <Button
                            onClick={handleUpload}
                            className="w-full bg-primary hover:bg-primary/90 text-white h-11 shadow-lg shadow-primary/20"
                            disabled={loading || !file || !formData.title}
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : "Publish Note"}
                        </Button>
                    </div>
                </div>

                {/* Guidelines Sidebar */}
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/5 border border-secondary/20">
                        <h3 className="font-bold text-white mb-2">Guidelines</h3>
                        <ul className="space-y-2 text-sm text-gray-400 list-disc list-inside">
                            <li>Ensure text is legible and clear.</li>
                            <li>No copyrighted textbooks allowed.</li>
                            <li>Add relevant tags for better reach.</li>
                            <li>Inappropriate content will lead to a ban.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
