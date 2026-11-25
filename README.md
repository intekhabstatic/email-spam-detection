# SpamSentry

SpamSentry is a small full-stack spam-detection demo. Paste a message into the web app to receive a spam prediction and estimated spam probability. The interface is served by FastAPI, so the frontend and prediction API run together.

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

The repository includes a Dockerfile and `render.yaml` for Render. Connect the GitHub repository in Render using **New → Blueprint**, review the `email-spam-detection` web service, and deploy. Render will provide the public URL when the service is ready.
