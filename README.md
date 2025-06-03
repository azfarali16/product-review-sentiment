# Product Review Sentiment Scraper - Installation Guide

Product Review Sentiment Scraper with FastAPI & Next.js


# Installation Guide

This project consists of two parts:
- **Backend** (FastAPI-based)
- **Frontend** (Next.js-based)

---

## Backend Setup

1. **Install dependencies**
   
```bash pip install -r requirements.txt ```

2. **Create the Google Excel service file**

- Follow the [Google Sheets API Python Quickstart](https://developers.google.com/sheets/api/quickstart/python) tutorial to create a service account and download the credentials JSON.
- Rename your credentials file to `excel_service_file.json`.
- Place `excel_service_file.json` in the backend directory.

3. **Run the backend**

```bash python app.py ```

## Frontend Setup

1. **Install dependencies**

```bash npm install ```

2. **Run the frontend**
```bash npm run dev ```
