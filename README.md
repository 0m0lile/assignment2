# Emmanuel Abimbola Portfolio

Personal Information Technology portfolio with **Mannie**, a voice-enabled AI assistant.

## Mannie

Mannie supports:
- General knowledge questions when the `/api/chat` backend is connected
- Questions about Emmanuel and this portfolio
- Text input
- Microphone speech-to-text
- Spoken AI responses

The front end calls `POST /api/chat`. Keep any AI API key on the server; never put a secret API key in browser JavaScript.

## Important

The ZIP contains the complete front-end project, but a real general-purpose AI requires a backend endpoint at `/api/chat`. If that endpoint is not running, Mannie falls back to portfolio-specific answers.

Open `index.html` with VS Code/Live Server to test the portfolio and voice UI.
