"use client";

import React, { useEffect, useState } from "react";
import { Star, ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";
import {
  fetchEntityReviews,
  submitEntityReview,
  voteEntityReview,
  type ReviewItem,
} from "@/services/catalog/catalogApi";

interface EntityReviewsSectionProps {
  venueId?: number;
  vendorId?: number;
  entityName: string;
}

export function EntityReviewsSection({
  venueId,
  vendorId,
  entityName,
}: EntityReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!venueId && !vendorId) {
        setLoading(false);
        return;
      }
      const list = await fetchEntityReviews({ venueId, vendorId });
      if (!active) return;
      setReviews(list);
      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, [venueId, vendorId]);

  const handleVote = async (reviewId: number, voteType: "helpful" | "unhelpful") => {
    setError(null);
    const res = await voteEntityReview(reviewId, voteType);
    if (!res.ok) {
      setError(res.status === 401 ? "Please sign in to vote on reviews." : res.error || "Vote failed.");
      return;
    }
    setReviews((prev) =>
      prev.map((r) =>
        r.review_id === reviewId
          ? {
              ...r,
              helpful_count:
                voteType === "helpful" ? (r.helpful_count ?? 0) + 1 : r.helpful_count,
              unhelpful_count:
                voteType === "unhelpful"
                  ? (r.unhelpful_count ?? 0) + 1
                  : r.unhelpful_count,
            }
          : r
      )
    );
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);
    if (!venueId && !vendorId) {
      setError("Verified catalog ID is required to submit a review.");
      return;
    }
    setSubmitting(true);
    const res = await submitEntityReview({
      ...(venueId ? { venueId } : { vendorId }),
      rating,
      reviewText: reviewText.trim(),
    });
    setSubmitting(false);

    if (!res.ok) {
      setError(
        res.status === 401
          ? "Please sign in to post a verified review."
          : res.error || "Could not submit review."
      );
      return;
    }

    setReviewText("");
    setFeedback("Thank you! Your review has been submitted for moderation.");
  };

  return (
    <div id="reviews" className="border-b border-gray-100 pb-6 scroll-mt-24 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-bold text-neutral-charcoal">
          Verified Reviews for {entityName}
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
          {loading ? "Loading..." : `${reviews.length} Approved`}
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}
      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {!loading && reviews.length === 0 ? (
          <p className="text-xs text-neutral-muted bg-[#FAF9F6] p-4 rounded-xl border border-gray-100">
            No public reviews yet for this listing. Be the first to share your experience below.
          </p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.review_id}
              className="p-4 bg-white border border-gray-150 rounded-[18px] shadow-sm flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-yellow-500">
                  {[...Array(Math.max(1, Math.min(5, Math.round(review.rating ?? 5))))].map(
                    (_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                    )
                  )}
                </div>
                <span className="text-[10px] text-neutral-muted">
                  {review.created_at
                    ? new Date(review.created_at).toLocaleDateString("en-IN")
                    : "Verified"}
                </span>
              </div>
              <p className="text-xs text-neutral-charcoal leading-relaxed">
                {review.review_text}
              </p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleVote(review.review_id, "helpful")}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-600 hover:text-[#8B263E] cursor-pointer"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>Helpful ({review.helpful_count ?? 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleVote(review.review_id, "unhelpful")}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-500 hover:text-neutral-800 cursor-pointer"
                >
                  <ThumbsDown className="w-3 h-3" />
                  <span>({review.unhelpful_count ?? 0})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {Boolean(venueId || vendorId) && (
        <form
          onSubmit={handleSubmitReview}
          className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#C5A880]/25 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-charcoal">
              Share Your Review
            </span>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              aria-label="Rating"
              className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-xs font-bold text-[#8B263E]"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} Stars
                </option>
              ))}
            </select>
          </div>
          <textarea
            rows={2}
            required
            minLength={10}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write at least 10 characters about your wedding experience..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-neutral-charcoal focus:outline-none focus:border-[#8B263E]"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-full bg-[#8B263E] hover:bg-[#6e1c2f] text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}
    </div>
  );
}
