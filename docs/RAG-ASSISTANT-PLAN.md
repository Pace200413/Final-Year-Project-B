# RAG Assistant – Minimal Implementation Plan

Rebuild the chatbot as a modern SaaS RAG assistant while keeping chat entry points and reusing existing support knowledge.

---

## 1. Smallest Set of New Files / Folders

Avoid folder explosion by adding **one new API route** and **one small lib module** for RAG. Reuse existing data paths.

| Add | Purpose |
|-----|--------|
| `src/app/api/assistant/route.ts` | Single POST handler: RAG (load → retrieve → LLM) and return `{ reply, sources }`. |
| `src/lib/rag.ts` | Load support content, build searchable snippets, run retrieval (e.g. simple keyword/embedding), return top‑k snippets. No new folder—sits next to existing `lib/`. |

**Do not add:** new `/api/assistant/*` subfolders, separate “brain” services, or extra config files unless you later add an LLM provider config.

**Optional later:**  
- `src/lib/rag-index.ts` – prebuild index at build time if you move to embeddings.  
- Env: `OPENAI_API_KEY` or similar for the model call (keep in env, not in repo).

---

## 2. What AssistantChat.tsx Should Do After Refactor (High Level)

- **Entry points unchanged**  
  - Still opened by **MobileShell** `ChatLauncher` (FAB) and any other place that mounts `<AssistantChat onClose={…} />`. Same props and behaviour from the shell’s perspective.

- **UI and UX**  
  - Keep the same chat UI: message list, user/bot bubbles, typing indicator, main menu (e.g. category grid), action buttons, drag-to-close. Only the **source of bot replies** changes.

- **Sending a message**  
  - On user send (or quick-action tap):  
    1. Append user message to the thread.  
    2. Show typing state.  
    3. Call **`POST /api/assistant`** with body e.g. `{ message: string, history?: { role: 'user'|'assistant', content: string }[] }`.  
    4. On success: append assistant message from `response.reply`, and if `response.sources` exists, show them (e.g. “Based on: …” or small source chips).  
    5. On error or fallback: show a safe fallback message (e.g. “I couldn’t find an answer in our support info. Please visit the Support page or use the contacts below.”) and optionally a link to `/support`.

- **No local “brain”**  
  - Remove the in-file `getBotResponse` / `handleContextFlow` and the large static `DEPARTMENTS` / `EMAIL_TEMPLATES` / `CATEGORIES` used only for that logic.  
  - Optionally keep a **minimal local fallback** only for “Main menu” / “Close” / “Copy” so the UI doesn’t need a round-trip for those; everything else goes through the API.

- **Copy / Main menu / Close**  
  - Keep handling “Copy message”, “Copy email”, “Main menu”, “Close chat” in the client (and any email templates you still want to offer from the UI). The API can return structured suggestions (e.g. “show_main_menu: true”) if you want, but the minimal approach is: API returns `reply` + `sources`; client renders reply and actions as it does today where applicable.

So in short: **AssistantChat stays the single chat UI; it stops calling a local state machine and instead calls `/api/assistant` for the assistant’s reply and sources, with a clear fallback when the API fails or returns no answer.**

---

## 3. What /api/assistant Should Do (RAG Steps)

Single **POST** handler that:

1. **Parse body**  
   - `message: string` (required), optional `history: { role, content }[]` for context.

2. **Load support content** (one place to maintain)  
   - Read from:  
     - `support-settings.json` (e.g. `src/data/support-settings.json` or via existing API that returns it).  
     - `support-faqs.ts` → export `FAQS` (q/a + tags).  
     - `support-services.ts` → export `SERVICES` (name, category, desc, hours, contact).  
   - Normalize into a list of **snippets** (e.g. `{ id, text, source }`).  
   - Example: each FAQ → one snippet; each service → one snippet (name + desc + hours + contact); shortcuts/alert from settings can be extra snippets.

3. **Retrieve top snippets**  
   - Use `src/lib/rag.ts`: given `message` (and optionally recent `history`), return top‑k snippets (e.g. 5–10).  
   - First implementation: simple keyword match (e.g. tokenize query + snippet text, score by overlap) or tag match for FAQs.  
   - Later: replace with embedding similarity in `rag.ts` without changing the route’s contract.

4. **Call the AI model**  
   - Build a prompt that:  
     - States the assistant’s role (campus support, answer only from the provided context).  
     - Injects the **retrieved snippets** as the only allowed context.  
     - Includes the user `message` (and optionally last N turns of `history`).  
     - Instructs: answer only from context; if not enough info, say so and suggest /support and key contacts (e.g. Security 082-260-607).  
   - Call your chosen provider (e.g. OpenAI, Azure OpenAI, or another API you control).  
   - Parse model output into a single `reply: string`.

5. **Return JSON**  
   - `{ reply: string, sources?: { id, text, source }[] }`.  
   - If the client needs to show “Based on: FAQ …”, use `sources`; the route can trim to top 3–5 for display.

---

## 4. Basic Safety: No Retrieval → Fallback

- **When retrieval finds nothing** (or score below a threshold):  
  - Do **not** call the LLM with empty context.  
  - Return a **fixed fallback** from the API, e.g.:  
    - `reply`: “I don’t have specific information on that in our support materials. Please visit the Support page for more options, or contact Campus Security (082-260-607) for emergencies.”  
    - `sources`: `[]` or omit.  
  - Optionally set a flag like `fallback: true` so the client can show a prominent link to `/support` and the same security/contact info.

- **When the LLM call fails** (rate limit, timeout, error):  
  - Return the same fallback reply (and no sources) with an appropriate HTTP status (e.g. 503) or 200 with `fallback: true` so the client always shows a safe message and a link to `/support` + contacts.

- **Prompt guardrails**  
  - In the prompt, instruct the model to answer **only** from the provided snippets and not to invent contacts or URLs.  
  - Fallback message should always direct users to `/support` and the known Security number so behaviour is predictable and safe.

---

## Summary

| Item | Action |
|------|--------|
| **New files** | `src/app/api/assistant/route.ts`, `src/lib/rag.ts` |
| **AssistantChat** | Same entry points (ChatLauncher, mount); replace local brain with `POST /api/assistant`; show `reply` + `sources`; handle errors with fallback + link to /support |
| **/api/assistant** | Load settings + FAQs + services → snippets → retrieve top‑k → prompt LLM with snippets only → return `reply` + `sources` |
| **Safety** | No retrieval or LLM failure → return fallback message; direct users to /support and Security 082-260-607 |

This keeps the repo minimal, preserves your existing chat entry points and support data, and gives a single, controllable RAG pipeline with a safe fallback when the system can’t answer from your content.
