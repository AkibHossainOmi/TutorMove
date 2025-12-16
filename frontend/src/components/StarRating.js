// src/components/StarRating.js
import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating, count, showCount = true, size = 16, className = "" }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(
        <FaStar key={i} className="text-amber-400" size={size} />
      );
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(
        <FaStarHalfAlt key={i} className="text-amber-400" size={size} />
      );
    } else {
      stars.push(
        <FaRegStar key={i} className="text-slate-300" size={size} />
      );
    }
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex gap-0.5">
        {stars}
      </div>
      {showCount && count !== undefined && (
        <span className="text-sm font-medium text-slate-500">
          ({count})
        </span>
      )}
    </div>
  );
};

export default StarRating;
