from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import pandas as pd
from recommender import Recommender
from forecaster import Forecaster
import uvicorn
import traceback
from pydantic import BaseModel
from rag_engine import RAGEngine
import face_auth
import voice_agent

app = FastAPI(title="AI Jewelry Recommendation & Forecasting API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models with the new combined dataset
DATA_PATH = "jewelry_combined.csv"
recommender = Recommender(DATA_PATH)
forecaster = Forecaster(DATA_PATH)
rag_engine = RAGEngine(DATA_PATH)

app.include_router(face_auth.router)
app.include_router(voice_agent.router)

@app.on_event("startup")
async def startup_event():
    # Note: We removed explicit model pre-loading to ensure fast startup for Render.
    # Models will be loaded lazily on the first request.
    
    # Inject RAGEngine dependency into Voice Agent
    voice_agent.set_rag_engine(rag_engine)

@app.get("/")
def read_root():
    return {"message": "AI Jewelry API is running with the combined dataset"}

@app.get("/recommend")
def get_recommendations(product_id: str, n: int = 5):
    try:
        # product_id here is the SKU string
        results = recommender.get_recommendations(product_id, n)
        if not results:
            raise HTTPException(status_code=404, detail="Product SKU not found in catalog")
        return results
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in recommendation: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/forecast")
def get_forecast(product_id: Optional[str] = None):
    try:
        results = forecaster.get_forecast(product_id)
        return results
    except Exception as e:
        print(f"Error in forecast: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/products")
def list_products(limit: int = 50):
    """Returns a list of unique products for the demo UI."""
    if recommender.products_df is None:
        return []
    
    # Take a sample for the listing
    sample = recommender.products_df.head(limit).to_dict(orient='records')
    
    # Ensure keys are frontend-friendly (SKU as product_id)
    formatted = []
    for p in sample:
        formatted.append({
            'product_id': str(p['SKU']),
            'product_name': str(p['ProductName']),
            'category_code': str(p['Category']),
            'price': float(p['Price(INR)']),
            'material': str(p['Material']),
            'gem': str(p['Style']), # Mapping Style to gem/secondary attribute for UI slots
            'color': str(p['Color']),
            'gender': str(p['Gender']),
            'occasion': str(p['Occasion']),
            'rating': float(p['Rating']) if not pd.isna(p['Rating']) else 0.0,
            'stock': int(p['Stock']) if not pd.isna(p['Stock']) else 0
        })
    return formatted

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    try:
        response = rag_engine.process_query(request.message)
        return response
    except Exception as e:
        print(f"Error in chat: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
