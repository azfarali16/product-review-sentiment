from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()

def get_sentiment(text: str) -> str:
    score = analyzer.polarity_scores(text)["compound"]
    if score >= 0.05:
        return "Positive"
    elif score <= -0.05:
        return "Negative"
    else:
        return "Neutral"

def analyze_sentiments(reviews: list) -> list:
    for review in reviews:
        original_text = review.get("content", "")
        review["sentiment"] = get_sentiment(original_text)
    return reviews
