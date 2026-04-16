import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI(title="Sentiment Engine API - Twitter Brain")

cors_origins = os.getenv(
    "BACKEND_CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
)
allowed_origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Downloading the Social Media brain... (might take a minute!)...")
# We explicitly call a much smarter model trained on modern social media text
sentiment_pipeline = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment-latest")
print("Brain loaded and ready for chaos!")

class TextInput(BaseModel):
    phrase: str


@app.get("/health")
def health():
    return {"status": "ok", "allowed_origins": allowed_origins}


@app.post("/analyze")
async def analyze_sentiment(input_data: TextInput):
    result = sentiment_pipeline(input_data.phrase)[0]
    
    # This model returns 'positive', 'neutral', or 'negative'
    label = result['label']
    confidence = result['score'] 
    
    if label == "positive":
        compound_score = confidence ** 2
        vibe = "positive"
    elif label == "negative":
        compound_score = -confidence
        vibe = "negative"
    else:
        # If the model specifically flags it as neutral (like a country name)
        compound_score = 0.0
        vibe = "neutral"

    return {
        "original_phrase": input_data.phrase,
        "score": compound_score,
        "vibe": vibe,
        "detailed_metrics": result
    }
