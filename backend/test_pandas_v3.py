import pandas as pd
import numpy as np
import os

DATA_PATH = "d:/jewelry_recommendation_system/backend/data/jewelry.csv"

try:
    print("Attempting to read csv with engine='python'...")
    df = pd.read_csv(DATA_PATH, engine='python')
    print("Read success!")
    print(df.head())
except Exception as e:
    print(f"Error: {e}")
