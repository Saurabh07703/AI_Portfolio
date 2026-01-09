import pandas as pd
import numpy as np

try:
    print("Attempting to create DataFrame manually...")
    data = [{'a': 1, 'b': 2}, {'a': 3, 'b': 4}]
    df = pd.DataFrame(data)
    print("DataFrame creation success!")
    print(df)
except Exception as e:
    print(f"Error: {e}")
