/**
 * Simple wrapper around the browser's built-in SpeechSynthesis (TTS).
 * No hook state needed since we just fire-and-forget speech.
 */
export function speakText(text, onEnd) {
  if (!window.speechSynthesis) return;

  // Stop anything currently being spoken before starting new speech
  window.speechSynthesis.cancel();

  // Clean text: strip triple backtick blocks (```...```) and inline code (`...`)
  let cleanedText = text
    .replace(/```[\s\S]*?```/g, " [code snippet] ")
    .replace(/`[^`]+?`/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanedText) {
    if (onEnd) onEnd();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanedText);
  utterance.lang = "en-US";
  utterance.rate = 1;

  if (onEnd) {
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
}
