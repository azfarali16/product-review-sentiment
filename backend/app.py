from fastapi import FastAPI, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware


from model import ScrapeRequest

from scraper import ReviewScraper
from utils import info_to_df
from sentiment import analyze_sentiments
from analysis import generate_analysis_json
from excel_handle import upload_to_excel

from webdriver_manager.microsoft import EdgeChromiumDriverManager
from selenium.webdriver.edge.service import Service


app = FastAPI(title="Product Review Scraper API")
service = Service(EdgeChromiumDriverManager().install())
sheet_link = "https://docs.google.com/spreadsheets/d/1L3ISSYeM45oMYSiR0K3XQOSCOAMR1mO0jkDKhCiwnP4/edit?usp=sharing"


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)


@app.get("/")
async def health_check():
    return {"status": "ok", "message": "API is up and running"}

@app.post("/scrape")
def scrape(request: ScrapeRequest):
    scraper = ReviewScraper(headless=True, service=service)
    try:
        # print(request)
        info = scraper.scrape_product(request.product_link, request.review_count)
    
        if not info.get('reviews'):
            raise HTTPException(status_code=404, detail="No reviews found or product inaccessible.")
        
        info['reviews'] = analyze_sentiments(info['reviews'])
        
        df = info_to_df(info)
        
        print("[INFO] uploading to excel")
        upload_to_excel(sheet_link,df)
        print("[INFO] uploaded")
        
        analysis = generate_analysis_json(df, info)
        return jsonable_encoder(analysis)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")

    finally:
        scraper.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)