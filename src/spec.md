# Specification

## Summary
**Goal:** Integrate Google Gemini into the existing chatbot so user messages are sent to a Motoko backend endpoint that calls the Gemini REST API and returns responses to the React UI with secure key handling and robust errors.

**Planned changes:**
- Add a new public backend method in `backend/main.mo` (e.g., `chatWithGemini(prompt : Text) : async Text`) that performs an IC HTTPS outcall to the Gemini REST API and returns the generated text response.
- Implement environment-based configuration for the Gemini API key (e.g., `GEMINI_API_KEY`) so it is never hardcoded and never exposed to the browser; return a clear error when missing/invalid.
- Add backend error handling + logging for Gemini request lifecycle and common failure modes (unauthorized/forbidden, rate limiting, timeout/network failures, unexpected response formats) without logging secrets.
- Refactor the backend code (still within the single `backend/main.mo` actor) into clearly separated internal modules/functions for Gemini request construction, HTTP execution, response parsing, and chat/prompt logic.
- Update `frontend/src/pages/ChatbotPage.tsx` to call the new backend Gemini chat method, preserve existing loading/typing state, and show user-friendly errors via existing error helpers; ensure Enter and Send use the same flow and no browser-side Gemini calls occur.
- Add documentation (e.g., `docs/gemini-chatbot.md`) with a complete backend example, frontend integration references, example `.env` structure, a sample request/response flow, and a step-by-step explanation of the end-to-end workflow including security/maintainability/scalability considerations.

**User-visible outcome:** In the chatbot page, users can send a message and receive a Gemini-generated reply; the UI shows loading while waiting and displays clear error messages when configuration or API calls fail.
