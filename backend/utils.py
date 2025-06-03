import re
from datetime import datetime
import pandas as pd
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def clean_review_text(text):
    text = text.strip()
    return re.sub(r'[^\w\s.,!?]', '', text)

def format_review_date(date_str):
    try:
        date_obj = datetime.strptime(date_str, "%d %b %Y")
        return date_obj.strftime("%Y-%m-%d")
    except Exception:
        return None

def info_to_df(info):
    product_name = info.get('name', '')
    product_ratings = info.get('ratings', 0)
    product_image = info.get('image', '')
    reviews = info.get('reviews', [])

    rows = []
    for review in reviews:
        row = {
            'product_name': product_name,
            'product_ratings': product_ratings,
            'product_image': product_image,
            'review_date' : review.get('date',''),
            'review_rating': review.get('rating', 0),
            'review_content': review.get('content', ''),
            'review_sentiment': review.get('sentiment', '')
        }
        rows.append(row)
    # print(rows)
    return pd.DataFrame(rows)


def wait_for_element(driver, by, value, timeout=20):
    return WebDriverWait(driver, timeout).until(EC.presence_of_element_located((by, value)))