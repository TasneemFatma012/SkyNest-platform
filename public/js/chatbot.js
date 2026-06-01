const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatWindow = document.getElementById('chatWindow');

function appendMessage(text, sender) {
  const message = document.createElement('div');
  message.className = `chat-message ${sender}`;
  message.textContent = text;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function sendChatMessage(text) {
  try {
    const res = await fetch('/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (res.ok) {
      appendMessage(data.reply, 'bot');
    } else {
      appendMessage(data.error || 'Something went wrong. Please try again.', 'bot');
    }
  } catch (err) {
    appendMessage('Unable to reach the chatbot service. Please try again later.', 'bot');
  }
}

if (chatForm && chatInput && chatWindow) {
  chatForm.addEventListener('submit', event => {
    event.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    appendMessage(text, 'user');
    chatInput.value = '';
    sendChatMessage(text);
  });
}
