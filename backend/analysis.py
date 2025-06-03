import pandas as pd
from collections import Counter

def generate_analysis_json(df: pd.DataFrame, info: dict):
    df['review_date'] = pd.to_datetime(df['review_date'], errors='coerce')
    df = df.dropna(subset=['review_date'])
    
    ratings_distribution = df['review_rating'].value_counts().to_dict()
    sentiment_distribution = df['review_sentiment'].value_counts().to_dict()
    avg_rating = round(df['review_rating'].mean(), 2)

    time_counts = df['review_date'].dt.to_period('M').astype(str).value_counts().to_dict()
    first_review_date = str(df['review_date'].min().date())
    last_review_date = str(df['review_date'].max().date())

    top_positive = df[df['review_sentiment'] == 'Positive'].sort_values(by='review_date', ascending=False).head(3)
    top_negative = df[df['review_sentiment'] == 'Negative'].sort_values(by='review_date', ascending=False).head(3)
    recent_reviews = df.sort_values(by='review_date', ascending=False).head(5)

    def serialize_reviews(subset):
        return [{
            "rating": int(row['review_rating']),
            "content": row['review_content'],
            "date": str(row['review_date'].date()),
            "sentiment": row['review_sentiment']
        } for _, row in subset.iterrows()]

    result = {
        "product": {
            "name": info.get('name', ''),
            "url": info.get('prod_url', ''),
            "ratings_count": info.get('ratings', 0),
            "image_url": info.get('image', '')
        },
        "review_stats": {
            "total_reviews": len(df),
            "ratings_distribution": {str(k): int(v) for k, v in ratings_distribution.items()},
            "sentiment_distribution": sentiment_distribution,
            "average_rating": avg_rating
        },
        "time_analysis": {
            "first_review_date": first_review_date,
            "last_review_date": last_review_date,
            "reviews_over_time": time_counts
        },
        "samples": {
            "top_positive_reviews": serialize_reviews(top_positive),
            "top_negative_reviews": serialize_reviews(top_negative),
            "recent_reviews": serialize_reviews(recent_reviews)
        }
    }
    return result
