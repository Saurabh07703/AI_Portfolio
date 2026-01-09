import os
from rag_engine import RAGEngine

def build_cache():
    print("Starting Build-Time Cache Generation...")
    
    # Path to your dataset
    data_path = "jewelry_combined.csv"
    
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found!")
        return

    # Initialize Engine
    engine = RAGEngine(data_path)
    
    # Force computation and saving
    engine.ensure_embeddings()
    
    print("Build-Time Cache Generation Complete.")

if __name__ == "__main__":
    build_cache()
