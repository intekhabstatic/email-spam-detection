const form = document.querySelector("#check-form");
const messageField = document.querySelector("#message");
const charCount = document.querySelector("#char-count");
const submitButton = document.querySelector("#submit-button");
const resultPanel = document.querySelector("#result");

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

  submitButton.disabled = true;
  submitButton.innerHTML = '<span class="spinner" aria-hidden="true"></span><span>Checking…</span>';
  resultPanel.hidden = false;
  resultPanel.className = "result loading";
  resultPanel.textContent = "Analyzing message text…";

  try {
    const response = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.detail || "The message could not be analyzed.");
    showPrediction(payload);
  } catch (error) {
    showError(error.message || "Could not connect to the classifier. Please try again.");
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = '<span>Check message</span><span aria-hidden="true">→</span>';
  }
});

function showPrediction(prediction) {
  const isSpam = prediction.is_spam;
  const percent = Math.round(prediction.spam_probability * 100);
  resultPanel.className = `result ${isSpam ? "spam" : "ham"}`;

  const icon = document.createElement("span");
  icon.className = "result-icon";
  icon.textContent = isSpam ? "!" : "✓";

  const content = document.createElement("div");
  const title = document.createElement("h2");
  title.textContent = isSpam ? "This looks like spam" : "This looks like a normal message";
  const description = document.createElement("p");
  description.textContent = `Estimated spam probability: ${percent}%. Treat this as a clue, not a guarantee.`;
  content.append(title, description);
  resultPanel.replaceChildren(icon, content);
}

function showError(message) {
  resultPanel.hidden = false;
  resultPanel.className = "result error";
  resultPanel.textContent = message;
}
