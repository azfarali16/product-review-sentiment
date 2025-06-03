import time
import re
from selenium import webdriver
from selenium.webdriver.edge.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException

from webdriver_manager.microsoft import EdgeChromiumDriverManager

from utils import clean_review_text, format_review_date ,  wait_for_element


service = Service(EdgeChromiumDriverManager().install())

class ReviewScraper:
    def __init__(self, headless=True, service = None):
        if not service:
            service = Service(EdgeChromiumDriverManager().install())
        self.service = service
        options = Options()
#         options.add_argument("--disable-logging")
        options.add_argument("--log-level=3")
        if headless:
            options.add_argument("--headless")
            options.add_argument("--disable-gpu")
            options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36")
            options.add_argument('--window-size=1920,1080')
            options.add_argument("--disable-blink-features=AutomationControlled")

        self.driver = webdriver.Edge(service=self.service, options=options)
        self.driver.set_page_load_timeout(90)
        self.driver.set_script_timeout(90)

    def close(self):
        if self.driver:
            self.driver.quit()

    def count_stars(self, item):
        try:
            star_imgs = item.find_elements(By.CLASS_NAME, 'star')
            return sum(1 for img in star_imgs if "TB19ZvE" in img.get_attribute("src"))
        except Exception:
            return 0

    def scrape_reviews(self, review_target=20):
        print('yay')
        time.sleep(5)
        collected_reviews = []
        seen_content = set()
        try:
            review_div = self.driver.find_element(By.CLASS_NAME, 'pdp-mod-review')
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", review_div)
        except Exception:
            return collected_reviews
        
        while len(collected_reviews) < review_target:
            try:
                WebDriverWait(self.driver, 5).until(EC.presence_of_element_located((By.CSS_SELECTOR, '.mod-reviews .item')))
                review_items = review_div.find_elements(By.CSS_SELECTOR, '.mod-reviews .item')

                new_reviews_found = 0
                for item in review_items:
                    if len(collected_reviews) >= review_target:
                        break
                    try:
                        content_elem = item.find_element(By.CLASS_NAME, 'content')
                        content = content_elem.text.strip()
                        date = item.find_element(By.CSS_SELECTOR,'.title.right').text
                        if not content or content in seen_content:
                            continue

                        rating = self.count_stars(item)
                        cleaned_content = clean_review_text(content)
                        formatted_date = format_review_date(date)
                        if not formatted_date:
                            continue

                        review = {
                            "rating": rating,
                            "content": cleaned_content,
                            "date": formatted_date
                        }
                        collected_reviews.append(review)
                        seen_content.add(content)
                        new_reviews_found += 1
                    except Exception:
                        continue
                
                if new_reviews_found == 0:
                    break
                
                try:
                    next_button = review_div.find_element(By.CSS_SELECTOR, 'button.next-pagination-item.next')
                    if next_button.get_attribute("disabled") or "disabled" in next_button.get_attribute("class"):
                        break
                    self.driver.execute_script("arguments[0].click();", next_button)
                    time.sleep(0.5)
                except Exception:
                    break
            except Exception:
                break
        return collected_reviews

    def get_product_info(self):
        info = {
            "name": "Unknown Product",
            'prod_url': self.driver.current_url,
            "ratings": 0,
            "image": None
        }

        try:
            info["name"] = self.driver.find_element(By.CLASS_NAME, 'pdp-product-title').text.strip()
        except NoSuchElementException:
            pass

        try:
            rating_text = self.driver.find_element(
                By.CSS_SELECTOR,
                ".pdp-link.pdp-link_size_s.pdp-link_theme_blue.pdp-review-summary__link"
            ).text.strip()
            if "No Ratings" in rating_text:
                info["ratings"] = 0
            else:
                match = re.search(r'(\d[\d,\.]*)', rating_text)
                if match:
                    info["ratings"] = int(match.group(1).replace(",", ""))
        except NoSuchElementException:
            pass

        try:
            image_url = self.driver.find_element(
                By.CSS_SELECTOR,
                '.pdp-mod-common-image.gallery-preview-panel__image'
            ).get_attribute('src')
            if image_url:
                info["image"] = image_url
        except NoSuchElementException:
            pass

        return info

#     def scrape_product(self, url, review_target=20):
#         self.driver.get(url)
#         time.sleep(2)  # Wait for page load
#         self.driver.get(url)
# #         self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")

#         last_height = self.driver.execute_script("return document.body.scrollHeight")
#         while True:
#             self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
#             time.sleep(1)  # wait for loading
#             new_height = self.driver.execute_script("return document.body.scrollHeight")
#             if new_height == last_height:
#                 break
#             last_height = new_height

#         wait_for_element(self.driver,By.CLASS_NAME,'pdp-mod-review')
#         info = self.get_product_info()
#         reviews = self.scrape_reviews(review_target=review_target)
#         info['reviews'] = reviews
#         return info

    def scrape_product(self, url, review_target=20):
        self.driver.get(url)
        self.driver.get(url)
        time.sleep(2)  # Wait for page load
        print("[INFO] Page loaded.")

        try:
            # Scroll to the expand button to trigger review loading
#             expand_button = WebDriverWait(self.driver, 15).until(
#                 EC.presence_of_element_located((By.CLASS_NAME, 'seller-link'))
#             )
#             self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", expand_button)
#             time.sleep(1)  # Allow smooth scroll to finish

#             # Wait for review section to load after scrolling
            wait_for_element(self.driver, By.CLASS_NAME, 'pdp-mod-review', timeout=15)
            time.sleep(1)  # Stabilize content after review section is visible
            print("[INFO] Review section loaded successfully.")
        except Exception as e:
            print(f"[WARN] Failed to scroll to expand button or load review section: {e}")

        info = self.get_product_info()
        reviews = self.scrape_reviews(review_target=review_target)
        info['reviews'] = reviews
        return info

