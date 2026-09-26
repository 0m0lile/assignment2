(() => {
  const openBtn = document.getElementById("mannie-open");
  const closeBtn = document.getElementById("mannie-close");
  const panel = document.getElementById("mannie-panel");
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-button");
  const micBtn = document.getElementById("mic-button");
  const messages = document.getElementById("chat-messages");
  const voiceStatus = document.getElementById("voice-status");
  const speakToggle = document.getElementById("speak-toggle");

  let speakReplies = true;
  let recognition = null;
  let conversation = [];

  function addMessage(text, type) {
    const el = document.createElement("div");
    el.className = `message ${type}`;
    el.textContent = text;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  }

  // These portfolio answers remain available even if no AI backend is configured.
  function portfolioFallback(text) {
    const q = text.toLowerCase();
    if (q.includes("who are you") || q.includes("what are you"))
      return "I'm Mannie, Emmanuel's AI assistant. I can answer general questions and questions about this portfolio.";
    if (q.includes("emmanuel") || q.includes("about"))
      return "Emmanuel Abimbola is an Information Technology student at Kean University. This portfolio highlights his technology projects, skills, coursework, and growth.";
    if (q.includes("skill"))
      return "The portfolio highlights web development, Information Technology, cybersecurity fundamentals, and tools such as VS Code, Git, Figma, and browser developer tools.";
    if (q.includes("project"))
      return "Featured projects include Emmanuel's personal portfolio, a website threat-modeling project, and Mannie, the AI assistant built into this site.";
    if (q.includes("kean") || q.includes("university"))
      return "Emmanuel studies Information Technology at Kean University.";
    return "I can answer general knowledge questions when the AI backend is connected. For now, I can answer questions about Emmanuel, his portfolio, skills, and projects.";
  }

  async function getMannieResponse(text) {
    // Connect this to your secure server endpoint when deployed.
    // Example backend contract: POST /api/chat -> { "reply": "..." }
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: conversation.slice(-10)
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) return data.reply;
      }
    } catch (_) {
      // Local fallback keeps the site usable if the backend is not running.
    }
    return portfolioFallback(text);
  }

  function speak(text) {
    if (!speakReplies || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, "user");
    conversation.push({ role: "user", content: text });
    input.value = "";

    const typing = document.createElement("div");
    typing.className = "message bot";
    typing.textContent = "Mannie is thinking…";
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;

    const response = await getMannieResponse(text);
    typing.remove();
    addMessage(response, "bot");
    conversation.push({ role: "assistant", content: response });
    speak(response);
  }

  openBtn.addEventListener("click", () => {
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    input.focus();
  });

  closeBtn.addEventListener("click", () => {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  });

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });

  speakToggle.addEventListener("click", () => {
    speakReplies = !speakReplies;
    speakToggle.setAttribute("aria-pressed", String(speakReplies));
    speakToggle.textContent = speakReplies
      ? "🔊 Read responses aloud: On"
      : "🔇 Read responses aloud: Off";
    if (!speakReplies && "speechSynthesis" in window) window.speechSynthesis.cancel();
  });

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      micBtn.classList.add("listening");
      voiceStatus.textContent = "Listening… speak now";
    };
    recognition.onend = () => {
      micBtn.classList.remove("listening");
      voiceStatus.textContent = "Voice ready";
    };
    recognition.onerror = event => {
      micBtn.classList.remove("listening");
      voiceStatus.textContent = `Voice error: ${event.error}`;
    };
    recognition.onresult = event => {
      input.value = event.results[0][0].transcript;
      sendMessage();
    };
    micBtn.addEventListener("click", () => {
      try { recognition.start(); } catch (_) {}
    });
  } else {
    micBtn.disabled = true;
    micBtn.title = "Speech recognition is not supported in this browser";
    voiceStatus.textContent = "Voice input is not supported by this browser";
  }
})();
