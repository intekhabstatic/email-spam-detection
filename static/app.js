const form = document.querySelector("#check-form");
const messageField = document.querySelector("#message");
const charCount = document.querySelector("#char-count");
const submitButton = document.querySelector("#submit-button");
const resultPanel = document.querySelector("#result");
const emptyState = document.querySelector("#empty-state");
const loadingState = document.querySelector("#loading-state");
const outcome = document.querySelector("#outcome");
const errorState = document.querySelector("#error-state");
const verdictBadge = document.querySelector("#verdict-badge");

messageField.addEventListener("input", () => {
  charCount.textContent = `${messageField.value.length.toLocaleString()} / 12,000`;
});

document.querySelectorAll(".sample").forEach((button) => {
  button.addEventListener("click", () => {
    messageField.value = button.dataset.sample;
    messageField.dispatchEvent(new Event("input"));
    messageField.focus();
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = messageField.value.trim();
  if (text.length < 3) {
    showError("Enter at least 3 characters so the model has text to analyze.");
    messageField.focus();
    return;
  }

  setState("loading");
  submitButton.disabled = true;
  submitButton.innerHTML = '<span class="spinner" aria-hidden="true"></span><span>Analyzing message…</span>';

  try {
    const response = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.detail || "The message could not be analyzed.");
    showPrediction(payload, text);
  } catch (error) {
    showError(error.message || "Could not connect to the classifier. Please try again.");
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = '<span>Analyze message</span><span class="submit-arrow" aria-hidden="true">→</span>';
  }
});

function setState(state) {
  emptyState.hidden = state !== "empty";
  loadingState.hidden = state !== "loading";
  outcome.hidden = state !== "result";
  errorState.hidden = state !== "error";
}

function showPrediction(prediction, text) {
  const isSpam = prediction.is_spam;
  const percent = Math.round(prediction.spam_probability * 100);
  resultPanel.classList.toggle("spam-result", isSpam);
  resultPanel.classList.toggle("ham-result", !isSpam);
  setState("result");

  verdictBadge.className = `verdict-badge ${isSpam ? "spam" : "ham"}`;
  verdictBadge.textContent = isSpam ? "Potential spam" : "Likely safe";
  document.querySelector("#result-icon").textContent = isSpam ? "!" : "✓";
  document.querySelector("#verdict-title").textContent = isSpam ? "This message looks suspicious" : "This message looks normal";
  document.querySelector("#verdict-description").textContent = isSpam
    ? "The classifier found patterns that are common in spam messages."
    : "The classifier found few patterns associated with spam.";
  document.querySelector("#preview-message").textContent = text;
  document.querySelector("#preview-length").textContent = `${text.length.toLocaleString()} characters`;
  document.querySelector("#spam-score").textContent = `${percent}%`;
  document.querySelector("#risk-meter").style.width = `${percent}%`;
}

function showError(message) {
  setState("error");
  resultPanel.classList.remove("spam-result", "ham-result");
  verdictBadge.className = "verdict-badge neutral";
  verdictBadge.textContent = "Needs attention";
  errorState.textContent = message;
}
