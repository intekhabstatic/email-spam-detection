# Spam Detention Project

Spam Detention Project is a full-stack message spam checker. Paste a message into the website to receive a prediction and estimated spam probability. FastAPI serves both the frontend and prediction API.

**Live demo:** [email-spam-detection-aefr.onrender.com](https://email-spam-detection-aefr.onrender.com/)

## Features

- Responsive message-checking interface with sample messages
- FastAPI prediction endpoint and interactive API documentation
- TF-IDF text features with a Multinomial Naive Bayes classifier
- Saved model artifact for quick startup without training at deploy time

## Model and data

The classifier follows the TF-IDF and Multinomial Naive Bayes approach in the original project notebook. It is trained on the [UCI SMS Spam Collection](https://archive.ics.uci.edu/dataset/228/sms+spam+collection), which contains 5,572 labeled messages. Because the training set contains SMS messages, predictions on long or formatted emails may be less reliable.

Using a stratified 80/20 holdout split (random state 42), the trained model reached **97.5% accuracy**, **100% spam precision**, and **81.2% spam recall**. These are dataset evaluation results, not a guarantee for new messages.

## Run locally

Python 3.11 or newer is recommended. The trained model is included, so you can start the app without downloading the data or retraining:

```bash
python -m venv .venv
```

Activate the environment, then run:

```bash
python -m pip install -r requirements.txt
python -m uvicorn app:app --reload --port 8000
```

Open <http://127.0.0.1:8000/>. API documentation is at <http://127.0.0.1:8000/docs>.

## Retrain the model

Download the UCI dataset archive and extract its `SMSSpamCollection` file into `data/SMSSpamCollection`. Then run:

```bash
python train_model.py
```

This evaluates the classifier on a holdout split, then fits and saves the model using the full dataset.

## API

- `GET /health` — service and model status
- `GET /api/info` — classifier and dataset information
- `POST /api/predict` — classify JSON such as `{"text":"Your message text"}`

## Deploy

The app is containerized with Docker and deployed on Render. Pushes to the connected GitHub branch can trigger a new deployment.

---

Created by **Intekhab Alam** · [GitHub](https://github.com/intekhabstatic)
