"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface RatingDialogProps {
    noteId: string;
    userId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function RatingDialog({ noteId, userId, isOpen, onClose, onSuccess }: RatingDialogProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (rating === 0) return;

        setLoading(true);
        try {
            await api.reviews.create({
                note_id: noteId,
                user_id: userId,
                rating,
                comment
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to submit review:", error);
            alert("Failed to submit review. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#1a1b26] border border-white/10 rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-white mb-2">Rate this Note</h2>
                <p className="text-sm text-gray-400 mb-6">How helpful was this resource? Your feedback helps others.</p>

                {/* Star Rating */}
                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                        >
                            <Star
                                className={`w-10 h-10 ${star <= (hoverRating || rating)
                                        ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                                        : "text-gray-600 fill-transparent"
                                    } transition-all duration-200`}
                            />
                        </button>
                    ))}
                </div>

                {/* Comment Input */}
                <div className="space-y-2 mb-6">
                    <label className="text-xs font-medium text-gray-300 uppercase tracking-wider ml-1">Comment (Optional)</label>
                    <textarea
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-colors min-h-[80px] resize-none text-sm"
                        placeholder="What did you like about this note?"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 text-gray-400 hover:text-white hover:bg-white/5"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={rating === 0 || loading}
                        className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Review"}
                    </Button>
                </div>

            </div>
        </div>
    );
}
