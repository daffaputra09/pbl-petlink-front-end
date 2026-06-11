"use client";

import { Star } from "lucide-react";

interface StarRatingDisplayProps {
  rating: number;
  size?: number;
  showValue?: boolean;
}

export default function StarRatingDisplay({
  rating,
  size = 16,
  showValue = false,
}: StarRatingDisplayProps) {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <div className="inline-flex items-center gap-1">
      <div className="inline-flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, index) => {
          const filled = index < safeRating;
          return (
            <Star
              key={index}
              size={size}
              className={
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-gray-100 text-gray-200"
              }
            />
          );
        })}
      </div>
      {showValue ? (
        <span className="text-sm font-semibold text-gray-700">
          {rating.toFixed(1)}
        </span>
      ) : null}
    </div>
  );
}
