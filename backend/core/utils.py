# core/utils.py

def update_trust_score(user):
    # Example: penalize if reported, reward if verified
    base = 1.0
    reviews = user.reviews_received.all()
    avg_rating = sum([r.rating for r in reviews]) / reviews.count() if reviews.exists() else 1
    base += (avg_rating - 3) * 0.3  # e.g., 5-star avg = +0.6, 1-star avg = -0.6
    if user.is_verified:
        base += 0.3
    # Add more: e.g., penalize spam reports, reward completed jobs, etc.
    user.trust_score = round(max(0.1, min(base, 2.0)), 2)
    user.save()
