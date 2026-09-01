# Ajaia Assessment Submission

**Candidate:** Mahavishnu (selvamvishnu25@gmail.com)
**Role:** Full Stack Product Engineer

---

## Live Application

> URL: _(Intentionally skipped per submission instructions - ran out of timebox for deployment)_

---

## Test Accounts

| Name       | Email                  | Password | Role        |
| ---------- | ---------------------- | -------- | ----------- |
| Mahavishnu | mahavishnu@example.com | password | Owner       |
| Demo User  | demo@example.com       | password | Shared user |

**Recommended review flow:**

- **Flow 1:** Login as `mahavishnu@example.com` → Create doc → Type some text with rich formatting → Wait 2s → See "Saved ✓" → Refresh page → Doc persists.
- **Flow 2:** Go to Documents list → Click "Import .txt / .md" → Upload a text file → See it instantly open as a new editable document.
- **Flow 3:** Click Share button → Share doc with `demo@example.com` → Logout → Login as `demo@example.com` → See doc under "Shared with me" → Open and verify access.

---

## Source Code

> GitHub / Google Drive: [https://github.com/mahavishnup/ajaia.git](https://github.com/mahavishnup/ajaia.git)

---

## Documentation

- [README.md](README.md) — local setup and run instructions
- [ARCHITECTURE.md](ARCHITECTURE.md) — system design and tradeoff decisions
- [AI_WORKFLOW.md](AI_WORKFLOW.md) — AI tools used, what I accepted/rejected, and how I verified

---

## Video Walkthrough

> URL: _(to be added)_

---

## Completed Features

- [x] Login with seeded users (Mahavishnu + Demo User)
- [x] Document list — "My Documents" and "Shared with me" sections
- [x] Create new document
- [x] Rename document (inline title editing)
- [x] Rich-text editing: Bold, Italic, Underline, H1, H2, H3, Bullet list, Numbered list
- [x] Auto-save (1.5s debounce) with "Saved ✓" status indicator
- [x] Refresh → document remains (full persistence)
- [x] File import: `.txt` and `.md` → creates editable document
- [x] Share document with another user by email
- [x] Owned vs shared document views (clear visual distinction)
- [x] Basic error handling (403 for unauthorized access, validation on share)
- [x] 8 automated Pest feature tests — all passing
- [x] README.md, ARCHITECTURE.md, AI_WORKFLOW.md

---

## Intentionally Deprioritized

| Feature                                        | Reason                                                                              |
| ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| Real-time collaboration                        | Requires WebSockets/Echo — significant infrastructure outside MVP scope             |
| Comments / suggestions                         | Not mentioned as required; would add substantial UI/DB complexity                   |
| Version history                                | Significant storage and UI complexity; not core to the 4-hour timebox               |
| Advanced permissions (viewer/commenter/editor) | Over-engineered for this scope; owner/editor distinction covers the requirement     |
| DOCX parsing                                   | `mammoth.js` adds complexity; `.txt` and `.md` fully satisfy the stated requirement |

---

## Next Improvements (2–4 hours)

1. **Real-time collaboration** via Laravel Echo + Pusher (cursors, live edits)
2. **Document version history** — snapshot on every manual save
3. **Role-based sharing** — viewer (read-only) vs editor permissions
4. **PDF export** via `dompdf` or browser print
5. **Full-text search** across document titles and content
