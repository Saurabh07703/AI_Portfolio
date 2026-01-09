import pandas as pd
import numpy as np
import os

DATA_PATH = "d:/jewelry_recommendation_system/backend/data/jewelry.csv"

print(f"Pandas version: {pd.__version__}")
print(f"Numpy version: {np.__version__}")

try:
    print("Attempting to read csv...")
    df = pd.read_csv(DATA_PATH, usecols=['product_id', 'category_code', 'color', 'metal', 'gem', 'price', 'brand_id'])
    print("Read success!")
    print(df.head())
except Exception as e:
    print(f"Error: {e}")
