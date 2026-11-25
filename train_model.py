"""Train and save the SMS spam classifier from the UCI SMS Spam Collection."""

from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

from spam_model import clean_text

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "SMSSpamCollection"
MODEL_FILE = BASE_DIR / "spam_pipeline.joblib"


def main() -> None:
    if not DATA_FILE.exists():
        raise FileNotFoundError(
            f"Dataset not found at {DATA_FILE}. Download the UCI SMS Spam Collection "
            "and place its SMSSpamCollection file in the data/ folder."
        )

    data = pd.read_csv(
        DATA_FILE,
        sep="\t",
        header=None,
        names=["label", "text"],
        encoding="utf-8",
    ).dropna()
    data["label"] = data["label"].str.strip().str.lower()
    data = data[data["label"].isin(["ham", "spam"])]

    train_text, test_text, train_labels, test_labels = train_test_split(
        data["text"],
        data["label"],
        test_size=0.2,
        random_state=42,
        stratify=data["label"],
    )

    pipeline = Pipeline(
        [
            (
                "tfidf",
                TfidfVectorizer(
                    preprocessor=clean_text,
                    ngram_range=(1, 2),
                    max_features=50_000,
                    min_df=1,
                ),
            ),
            ("classifier", MultinomialNB(alpha=0.35)),
        ]
    )
    pipeline.fit(train_text, train_labels)
    predictions = pipeline.predict(test_text)

    print(f"Messages: {len(data):,}")
    print(f"Holdout accuracy: {accuracy_score(test_labels, predictions):.3f}")
    print(classification_report(test_labels, predictions, digits=3, zero_division=0))

    # Fit the production artifact on the complete dataset after reporting holdout metrics.
    pipeline.fit(data["text"], data["label"])
    joblib.dump(pipeline, MODEL_FILE, compress=3)
    print(f"Saved model to {MODEL_FILE}")


if __name__ == "__main__":
    main()
