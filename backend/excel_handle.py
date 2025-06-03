
import pygsheets
import pandas as pd


def upload_to_excel(sheet_link, df):
    """
    Uploads/updates the given DataFrame `df` into the 'EPD Indicators' worksheet
    of the Google Sheet identified by `sheet_link`.
    The new DataFrame is appended to the existing data.
    """
    service_file = 'excel_service_file.json'
    gc = pygsheets.authorize(service_file=service_file)

    sheet = gc.open_by_url(sheet_link)

    product_reviews_wks = sheet.worksheet_by_title('Reviews')

    product_reviews_df = product_reviews_wks.get_as_df()

    if product_reviews_df.empty:
        new_df = df
    else:
        new_df = pd.concat([product_reviews_df, df], ignore_index=True)

    rows, columns = new_df.shape

    product_reviews_wks.clear(start=(1, 1))

    product_reviews_wks.resize(rows, columns)
    product_reviews_wks.set_dataframe(new_df, start=(1, 1))

