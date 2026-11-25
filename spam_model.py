"""Text preprocessing shared by spam-model training and inference."""

import re

from nltk.stem import PorterStemmer
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

_stemmer = PorterStemmer()
_token_pattern = re.compile(r"[a-z0-9]+")


def clean_text(text: str) -> str:
    """Normalize text using the notebook's stop-word removal and Porter stemming."""
    tokens = _token_pattern.findall(str(text).lower())
    return " ".join(_stemmer.stem(token) for token in tokens if token not in ENGLISH_STOP_WORDS)
