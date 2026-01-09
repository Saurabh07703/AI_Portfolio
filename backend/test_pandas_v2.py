import pandas as pd
import numpy as np
import os

DATA_PATH = "d:/jewelry_recommendation_system/backend/data/jewelry.csv"

try:
    print("Attempting to read csv WITHOUT usecols...")
    df = pd.read_csv(DATA_PATH)
    print("Read success!")
    print(df.columns)
    # Filter after reading
    df = df[['product_id', 'category_code', 'color', 'metal', 'gem', 'price', 'brand_id']]
    print("Filtering success!")
    print(df.head())
except Exception as e:
    print(f"Error: {e}")
