import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import os
import random

class RAGEngine:
    def __init__(self, data_path):
        self.data_path = data_path
        self.df = None
        self.products_df = None
        self.embeddings = None
        # Load a lightweight, high-performance model for local embeddings
        print("Loading embedding model...")
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.load_data()

    def load_data(self):
        if not os.path.exists(self.data_path):
            print(f"Error: {self.data_path} not found.")
            return

        print("Loading data for RAG...")
        self.df = pd.read_csv(self.data_path)
        
        # Deduplicate by SKU
        self.products_df = self.df.drop_duplicates(subset=['SKU']).copy()
        
        # Create a rich description for semantic search
        def create_search_text(x):
            # Weighing certain fields more by repeating them or structuring them
            return f"Category: {x['Category']}. Material: {x['Material']}. Style: {x['Style']}. Color: {x['Color']}. Gender: {x['Gender']}. Occasion: {x['Occasion']}. Name: {x['ProductName']}."

        self.products_df['search_text'] = self.products_df.apply(create_search_text, axis=1)
        
        # Pre-compute embeddings
        print("Computing product embeddings...")
        self.embeddings = self.model.encode(self.products_df['search_text'].tolist(), show_progress_bar=True)
        print("RAG Engine initialized.")

    def search_products(self, query, n=4):
        """
        Retrieves the top N products matching the query using semantic search.
        """
        if self.products_df is None or self.embeddings is None:
            return []

        # Encode the query
        query_embedding = self.model.encode([query])
        
        # Compute similarity
        similarities = cosine_similarity(query_embedding, self.embeddings).flatten()
        
        # Get top N indices
        top_indices = np.argsort(similarities)[::-1][:n]
        
        results = []
        for idx in top_indices:
            score = similarities[idx]
            if score < 0.2: # Low relevance threshold
                continue
                
            prod = self.products_df.iloc[idx]
            results.append({
                'product_id': str(prod['SKU']),
                'product_name': str(prod['ProductName']),
                'category_code': str(prod['Category']),
                'price': float(prod['Price(INR)']),
                'image_url': f"https://placehold.co/300x300?text={prod['ProductName'].replace(' ', '+')}", # Placeholder or real URL if available
                'material': str(prod['Material']),
                'score': float(score)
            })
            
        return results

    def generate_response(self, query, products):
        """
        Generates a natural language response based on the query and retrieved products.
        """
        if not products:
            return "I couldn't find any jewelry matching that description. Could you try being more specific? Maybe mention a material (gold, silver) or occasion (wedding, party)?"

        # Analyze the result set
        top_product = products[0]
        count = len(products)
        
        # Extract attributes for the top product
        name = top_product['product_name']
        material = top_product['material']
        price = top_product['price']
        category = top_product['category_code']
        
        # suggestion logic based on category/occasion (simple keyword matching)
        suggestion = ""
        if 'Wedding' in name or 'Engagement' in name:
            suggestion = " It would be a perfect choice for a special celebration."
        elif 'Party' in name:
            suggestion = " It will definitely make you stand out at any event."
        elif 'Office' in name or 'Work' in name:
            suggestion = " It has a subtle elegance suitable for daily wear."

        # Template selection
        if count == 1:
            return f"I found the {name}. It is crafted from {material} and costs {int(price)} rupees.{suggestion} Would you like to add it to your cart?"
        else:
            # Summary for multiple items
            min_price = min([p['price'] for p in products])
            max_price = max([p['price'] for p in products])
            
            main_desc = f"I found the {name}, which is made of {material} and priced at {int(price)} rupees."
            
            if count > 1:
                follow_up = f" I also found {count-1} other options, ranging from {int(min_price)} to {int(max_price)} rupees."
            else:
                follow_up = ""
                
            return f"{main_desc}{suggestion}{follow_up} You can see them all on your screen."

    def get_generic_response(self, query):
        """
        Handles generic conversational queries to make the bot feel more natural.
        """
        q = query.lower().strip()
        # Simple tokenization
        tokens = set(q.replace('?', '').replace('!', '').replace('.', '').split())
        
        # Extended greetings matching (includes 'hii', 'heya', etc.)
        greeting_roots = ['hi', 'hello', 'hey', 'greetings', 'hola', 'namaste']
        is_greeting = any(tok in greeting_roots or (tok.startswith('hi') and len(tok) <= 4) for tok in tokens)
        
        if is_greeting:
             return "Hello! I'm your AI jewelry assistant. I can help you find necklaces, rings, earrings, and more. What are you looking for today?"

        if 'help' in q or 'what can you do' in q:
             return "I can help you find jewelry based on your preferences. Try asking for 'gold earrings for a wedding' or 'diamond necklace under 50,000'."
             
        if 'thank' in q or 'thanks' in tokens:
             return "You're welcome! Let me know if you'd like to see more options."
             
        if 'how are you' in q:
             return "I'm doing great, thanks for asking! I'm ready to help you find the perfect piece of jewelry."

        if 'who are you' in q or 'what are you' in q:
             return "I am an intelligent assistant designed to help you explore our exclusive jewelry collection."

        # --- General Info for Voice Agent ---
        if 'time' in q or 'hour' in q or 'open' in q:
            return "We are open Monday to Saturday from 10 AM to 8 PM. Our online store is open 24/7."
            
        if 'location' in q or 'address' in q or 'where' in q:
            return "We are located at 123 Jewelry Lane, Mumbai. You can also find us online at www.aijewelry.com."
            
        if 'return' in q or 'policy' in q or 'refund' in q:
            return "We offer a 30-day no-questions-asked return policy on all unworn items with original tags."
            
        if 'call' in q or 'phone' in q or 'contact' in q:
            return "You are speaking with our AI representative right now. For human support, please email support@aijewelry.com."

        # --- Simple Chitchat & Personality ---
        if 'cool' in tokens or 'nice' in tokens or 'wow' in tokens or 'amazing' in tokens:
             return "I'm glad you like it! Our collection is truly special."
             
        if 'bye' in tokens or 'goodbye' in tokens:
             return "Goodbye! Have a wonderful day."

        if 'stupid' in tokens or 'dumb' in tokens or 'idiot' in tokens:
             return "I'm still learning and doing my best to help you. Let's try finding some jewelry instead."

        if 'love you' in q:
             return "That's very kind of you! I love helping you find beautiful things."

        return None

    def process_query(self, query):
        """
        End-to-end processing: Search -> Generate -> Return
        """
        # 1. Check for generic conversational queries
        generic_response = self.get_generic_response(query)
        if generic_response:
            return {
                "response_text": generic_response,
                "products": []
            }

        # 2. Product Search
        products = self.search_products(query)
        response_text = self.generate_response(query, products)
        
        return {
            "response_text": response_text,
            "products": products
        }

if __name__ == "__main__":
    # Test locally
    engine = RAGEngine("jewelry_combined.csv")
    print(engine.process_query("gold wedding ring"))
