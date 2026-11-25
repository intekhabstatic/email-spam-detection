"""Spam detection web app and JSON API."""

from contextlib import asynccontextmanager
from pathlib import Path

import joblib
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

import spam_model  # Required to load the vectorizer's custom text preprocessor.

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "spam_pipeline.joblib"
model = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    if not MODEL_PATH.is_file():
        raise RuntimeError("The spam model is missing. Run train_model.py to create it.")
    model = joblib.load(MODEL_PATH)
    yield
    model = None


app = FastAPI(
    title="SpamSentry API",
    description="Classifies message text using a TF-IDF and Multinomial Naive Bayes model.",
    version="1.0.0",
    lifespan=lifespan,
)


class PredictionRequest(BaseModel):
    text: str = Field(min_length=3, max_length=12000)


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}


@app.get("/api/info")
def info():
    return {
        "name": "SpamSentry",
        "model": "TF-IDF + Multinomial Naive Bayes",
        "training_dataset": "UCI SMS Spam Collection",
    }


@app.post("/api/predict")
def predict(request: PredictionRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="The classifier is not ready yet.")

    message = request.text.strip()
    if len(message) < 3:
        raise HTTPException(status_code=422, detail="Enter at least 3 characters.")

    label = str(model.predict([message])[0])
    class_names = list(model.named_steps["classifier"].classes_)
    probability = model.predict_proba([message])[0]
    spam_probability = float(probability[class_names.index("spam")])
    return {
        "label": label,
        "is_spam": label == "spam",
        "spam_probability": round(spam_probability, 4),
        "confidence": round(float(max(probability)), 4),
    }


app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
app.mount("/", StaticFiles(directory=BASE_DIR / "static", html=True), name="website")
