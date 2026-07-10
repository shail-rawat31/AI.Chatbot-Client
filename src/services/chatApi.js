import axios from "axios";

const API_BASE_URL = "https://ai-chatbot-server-mjez.onrender.com";

/**
 * Sends a message + conversation history to the backend and
 * returns the assistant's reply text.
 */
export async function sendMessage(message, history, attachment = null) {
  const response = await axios.post(`${API_BASE_URL}/chat`, {
    message,
    history,
    attachment,
  });
  return response.data.reply;
}
