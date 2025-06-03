from pydantic import BaseModel, Field

class ScrapeRequest(BaseModel):
    product_link: str = Field(..., description="Product page URL")
    review_count: int = Field(20, gt=0, le=100, description="Number of reviews to scrape (max 100)")
