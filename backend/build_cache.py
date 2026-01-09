import os
from rag_engine import RAGEngine
from facenet_pytorch import MTCNN, InceptionResnetV1
import torch

def build_cache():
    print("Starting Build-Time Cache Generation...")
    
    # Path to your dataset
    data_path = "jewelry_combined.csv"
    
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found!")
        return

    # Initialize Engine
    engine = RAGEngine(data_path)
    
    print("Downloading FaceNet models for cache...")
    # This triggers the download to ~/.cache/torch/checkpoints which Render persists
    device = torch.device('cpu') 
    mtcnn = MTCNN(image_size=160, margin=0, keep_all=False, device=device)
    resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)
    print("FaceNet models cached.")
    
    # Force computation and saving
    engine.ensure_embeddings()
    
    print("Build-Time Cache Generation Complete.")

if __name__ == "__main__":
    build_cache()
