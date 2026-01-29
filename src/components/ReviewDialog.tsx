import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star, X } from 'lucide-react';

interface ReviewDialogProps {
    noteId: string;
    noteTitle: string;
    userId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function ReviewDialog({ noteId, noteTitle, userId, isOpen, onClose, onSuccess }: ReviewDialogProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    noteId,
                    userId,
                    rating,
                    comment: comment.trim() || null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit review');
            }

            alert('Review submitted successfully!');
            onSuccess?.();
            onClose();
            setRating(0);
            setComment('');
        } catch (error) {
            console.error('Error submitting review:', error);
            alert(error instanceof Error ? error.message : 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card max-w-md w-full p-6 relative animate-scale-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <h2 className="text-2xl font-bold text-white mb-2">Write a Review</h2>
                <p className="text-gray-400 text-sm mb-6">Share your thoughts about "{noteTitle}"</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Rating Stars */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Your Rating *
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 transition-colors ${star <= (hoveredRating || rating)
                                                ? 'fill-yellow-500 text-yellow-500'
                                                : 'text-gray-600'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-sm text-gray-400 mt-2">
                                {rating === 1 && '⭐ Poor'}
                                {rating === 2 && '⭐⭐ Fair'}
                                {rating === 3 && '⭐⭐⭐ Good'}
                                {rating === 4 && '⭐⭐⭐⭐ Very Good'}
                                {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
                            </p>
                        )}
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Your Review (Optional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share more about your experience with this note..."
                            className="w-full glass-input min-h-[120px] resize-none"
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1">{comment.length}/500 characters</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="glass"
                            className="flex-1"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-primary text-white hover:bg-primary/90"
                            disabled={loading || rating === 0}
                        >
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
