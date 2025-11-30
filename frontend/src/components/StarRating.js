
import React from 'react';
import { FiStar } from 'react-icons/fi';

const StarRating = ({ rating, count, showCount = true, size = 16 }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(
        <FiStar key={i} className="text-yellow-400 fill-current" size={size} />
      );
    } else if (i === fullStars + 1 && hasHalfStar) {
      // Approximate half star with full star for simplicity or use a half-star icon if available
      // react-icons/fi doesn't have half star.
      // Using full star but maybe lighter color or gradient?
      // For now, let's just stick to full/empty logic or use a different library if needed.
      // Or just map full stars.
      // Let's stick to full stars for filled and gray for empty.
      // Rounding:
      stars.push(
         <FiStar key={i} className="text-gray-300" size={size} />
      );
    } else {
      stars.push(
        <FiStar key={i} className="text-gray-300" size={size} />
      );
    }
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {/* We can do better. Let's just map 5 stars and color them based on rating */}
        {[1, 2, 3, 4, 5].map((star) => (
            <FiStar
                key={star}
                size={size}
                className={`${star <= Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-gray-500 ml-1">
          ({count} {count === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};

export default StarRating;
