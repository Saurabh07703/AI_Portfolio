import os
import json
import base64
import io
import torch
import numpy as np
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Body
from pydantic import BaseModel
from PIL import Image
from facenet_pytorch import MTCNN, InceptionResnetV1
from sklearn.metrics.pairwise import cosine_similarity

router = APIRouter(tags=["Face Authentication"])

# --- Configuration ---
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
FACES_FILE = os.path.join(DATA_DIR, "faces.json")
os.makedirs(DATA_DIR, exist_ok=True)

# --- Global Models (Lazy Loading to prevent slow startup if not used) ---
mtcnn = None
resnet = None

def get_models():
    global mtcnn, resnet
    if mtcnn is None:
        print("Loading FaceNet models...")
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        # MTCNN for face detection (using keep_all=False to get the best face)
        mtcnn = MTCNN(image_size=160, margin=0, keep_all=False, device=device)
        # InceptionResnetV1 for embedding
        resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)
        print("FaceNet models loaded.")
    return mtcnn, resnet

# --- Helper Functions ---
def load_faces():
    if not os.path.exists(FACES_FILE):
        return {}
    try:
        with open(FACES_FILE, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading faces: {e}")
        return {}

def save_faces(faces_data):
    with open(FACES_FILE, "w") as f:
        json.dump(faces_data, f, indent=2)

def process_image(image_file: UploadFile):
    """Reads an upload file and converts it to a PIL Image."""
    try:
        image_bytes = image_file.file.read()
        image = Image.open(io.BytesIO(image_bytes))
        # Convert to RGB if not already (e.g. if PNG has alpha)
        if image.mode != 'RGB':
            image = image.convert('RGB')
        return image
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")

def get_embedding(image: Image.Image):
    mtcnn_model, resnet_model = get_models()
    
    # Detect face and crop
    # mtcnn returns a tensor of shape (3, 160, 160) if a face is found
    img_cropped = mtcnn_model(image)
    
    if img_cropped is None:
        return None  # No face detected
    
    # Calculate embedding
    # resnet expects a batch, so we unsqueeze(0)
    embedding = resnet_model(img_cropped.unsqueeze(0))
    
    # Detach from graph and convert to numpy
    return embedding.detach().cpu().numpy()[0]

# --- Endpoints ---

@router.post("/face/register")
async def register_face(name: str = Form(...), file: UploadFile = File(...)):
    """
    Registers a new face with a name.
    """
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")
    
    image = process_image(file)
    embedding = get_embedding(image)
    
    if embedding is None:
        raise HTTPException(status_code=400, detail="No face detected in the image.")
    
    faces = load_faces()
    
    # Check if name already exists (optional: allow overwriting or list)
    # For simplicity, we overwrite or add
    faces[name] = embedding.tolist() # Convert numpy array to list for JSON serialization
    
    save_faces(faces)
    
    return {"message": f"Face registered successfully for user: {name}"}

@router.post("/face/recognize")
async def recognize_face(file: UploadFile = File(...)):
    """
    Recognizes a face from the uploaded image.
    Returns the matched name if similarity > threshold.
    """
    image = process_image(file)
    embedding = get_embedding(image)
    
    if embedding is None:
        raise HTTPException(status_code=400, detail="No face detected.")
    
    faces = load_faces()
    if not faces:
        raise HTTPException(status_code=404, detail="No registered faces found.")
    
    best_match = None
    best_score = -1.0
    threshold = 0.6  # typical threshold for Facenet, might need tuning
    
    # Compare with all registered faces
    target_emb = embedding.reshape(1, -1)
    
    for name, stored_emb_list in faces.items():
        stored_emb = np.array(stored_emb_list).reshape(1, -1)
        score = cosine_similarity(target_emb, stored_emb)[0][0]
        
        if score > best_score:
            best_score = score
            best_match = name
            
    if best_score > threshold:
        return {
            "match": True,
            "user": best_match,
            "confidence": float(best_score)
        }
    else:
        return {
            "match": False,
            "user": None,
            "confidence": float(best_score) if best_score > -1 else 0.0,
            "message": "Face not recognized"
        }

@router.get("/face/list")
def list_faces():
    faces = load_faces()
    return {"registered_users": list(faces.keys())}
