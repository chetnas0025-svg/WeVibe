import React, { useState } from 'react';
import { X, Star, Send, Sparkles } from 'lucide-react';

export default function ReviewModal({ isOpen, onClose, onAddReview }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Food Lover');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      alert("Please fill in your name and review comment.");
      return;
    }

    onAddReview({
      name,
      role,
      rating,
      comment,
      created_at: new Date().toISOString()
    });

    setName('');
    setComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-gold/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        
        {/* Close Cross Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-cream-100 hover:bg-cream-200 text-espresso-800 flex items-center justify-center transition-colors"
          aria-label="Close Review Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-full bg-gold-light/20 text-gold-dark flex items-center justify-center mx-auto mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-2xl text-espresso-900">Write a Review</h3>
          <p className="text-xs text-espresso-800/70">Share your dining experience at We Vibes Cafe</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Rating Selection */}
          <div className="space-y-1 text-center">
            <label className="text-xs font-bold text-espresso-900">Your Rating</label>
            <div className="flex justify-center gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star className={`w-6 h-6 ${star <= rating ? 'fill-gold text-gold' : 'text-cream-200'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-espresso-900">Your Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ananya Sharma"
              className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-xs focus:outline-none focus:border-gold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-espresso-900">Tag / Role (Optional)</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Food Blogger, Regular Guest..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-xs focus:outline-none focus:border-gold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-espresso-900">Your Review *</label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the food quality, ambiance, and service..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-cream-50 border border-gold/30 text-xs focus:outline-none focus:border-gold"
            />
          </div>

          {/* Action Buttons: Cancel and Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full bg-cream-100 hover:bg-cream-200 text-espresso-800 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-full bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Review</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
