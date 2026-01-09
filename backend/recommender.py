import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
import os

class Recommender:
    def __init__(self, data_path):
        self.data_path = data_path
        self.df = None
        self.products_df = None
        self.tfidf_matrix = None
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.load_data()

    def load_data(self):
        if not os.path.exists(self.data_path):
            print(f"Error: {self.data_path} not found.")
            return

        # Load the combined dataset
        self.df = pd.read_csv(self.data_path)
        
        # Product IDs are strings (SKUs). 
        # Deduplicate to get unique product catalog
        self.products_df = self.df.drop_duplicates(subset=['SKU']).copy()
        
        # Fill missing values
        cols_to_fill = ['Material', 'Style', 'Color', 'Gender', 'Occasion', 'Category']
        for col in cols_to_fill:
            if col in self.products_df.columns:
                self.products_df[col] = self.products_df[col].fillna('')

        self.train_content_based()

    def train_content_based(self):
        # Build the 'soup' feature for recommendation
        def create_soup(x):
            return f"{x['Category']} {x['Material']} {x['Style']} {x['Color']} {x['Gender']} {x['Occasion']} {x['ProductName']}"

        self.products_df['soup'] = self.products_df.apply(create_soup, axis=1)
        self.tfidf_matrix = self.vectorizer.fit_transform(self.products_df['soup'])

    def get_recommendations(self, sku, n=5):
        if self.products_df is None or self.tfidf_matrix is None:
            return []

        # Find the index of the product that matches the SKU
        idx_list = self.products_df.index[self.products_df['SKU'] == sku].tolist()
        if not idx_list:
            return []
        
        # Get the actual positional index in the unique dataframe
        pos_idx = self.products_df.index.get_loc(idx_list[0])

        # Compute cosine similarity
        cosine_sim = linear_kernel(self.tfidf_matrix[pos_idx:pos_idx+1], self.tfidf_matrix).flatten()
        
        # Get top N similar products (excluding itself)
        sim_scores = list(enumerate(cosine_sim))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = sim_scores[1:n+1]

        recommendations = []
        for i, score in sim_scores:
            prod = self.products_df.iloc[i]
            recommendations.append({
                'product_id': str(prod['SKU']),
                'product_name': str(prod['ProductName']),
                'category_code': str(prod['Category']),
                'price': float(prod['Price(INR)']),
                'material': str(prod['Material']),
                'color': str(prod['Color']),
                'rating': float(prod['Rating']) if not pd.isna(prod['Rating']) else 0.0,
                'stock': int(prod['Stock']) if not pd.isna(prod['Stock']) else 0,
                'score': float(score)
            })

        return recommendations

if __name__ == "__main__":
    reco = Recommender("jewelry_combined.csv")
    print(reco.get_recommendations("RJ0001"))
