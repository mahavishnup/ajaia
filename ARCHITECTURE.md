# Architecture — Ajaia Docs

## Decision: Modular Monolith

I intentionally chose a **modular monolithic architecture** rather than microservices. The assessment prioritizes a complete, deployable product slice. The expected workload does not justify distributed-system complexity, and the design keeps document, sharing, and import concerns separated enough that they can be extracted later if scale requires it.

---

## System Diagram

```
Browser (React + TypeScript)
        │
        │  Inertia.js (SPA-style, no REST JSON API)
        ▼
Laravel 13 Application (PHP 8.4)
        │
        ├── DocumentController  ─── Documents + sharing + file import
        ├── Fortify Auth        ─── Login / logout / registration
        └── Settings            ─── Profile management
        │
        ▼
SQLite (database.sqlite)
        │
        ├── users
        ├── documents
        └── document_shares
```

---

## Data Model

### `users`
Standard Laravel user table. Two seeded accounts for demonstration.

### `documents`
```
id          primary key
user_id     FK → users (owner)
title       string (default: "Untitled document")
content     longText (HTML from TipTap)
created_at
updated_at
```

### `document_shares`
```
id           primary key
document_id  FK → documents (cascades on delete)
user_id      FK → users (the person being shared with)
shared_by    FK → users (the owner who initiated the share)
created_at
UNIQUE(document_id, user_id)
```

---

## Authorization Model

Simple, two-tier access:

| Action | Owner | Shared User | Unrelated User |
|---|---|---|---|
| View | ✓ | ✓ | ✗ |
| Edit content | ✓ | ✓ | ✗ |
| Rename | ✓ | ✓ | ✗ |
| Share | ✓ | ✗ | ✗ |
| Delete | ✓ | ✗ | ✗ |

Enforced in `DocumentController` via `authorizeAccess()` (view/edit) and `authorizeOwner()` (share/delete). No Laravel Policies were introduced — the controller-level guard is sufficient and simpler for this scope.

---

## Frontend Architecture

The frontend uses **Inertia.js v3** — which means no separate REST API. Pages are React components rendered server-side by Laravel and hydrated client-side. Navigation is SPA-style with full server data.

Key frontend decisions:
- **TipTap** for rich-text editing (StarterKit covers most formatting; Underline added separately)
- **Auto-save** via a 1.5s debounce timer — no websockets needed
- **Share endpoint** uses `fetch()` with JSON to get the created share back without a page reload
- **Wayfinder** generates typed TypeScript functions for all Laravel routes — no hardcoded URLs

---

## What I Deprioritized

| Feature | Why |
|---|---|
| Real-time collaboration | Requires WebSockets/Echo — out of scope |
| Version history | Significant storage/UI complexity |
| DOCX parsing | `mammoth.js` adds complexity; .txt/.md covers the requirement |
| Complex permissions (viewer/commenter/editor roles) | Over-engineered for this scope |
| Service layer / Repository pattern | AI initially suggested this. Rejected — increases complexity with no meaningful benefit at this scale |

---

## Rejected AI Suggestion

> The initial AI suggestion included a separate `DocumentService` class and a `DocumentRepository` for data access abstraction. I rejected this because it adds indirection and boilerplate with no meaningful benefit at the current scale. The controller is the right level of abstraction here.

---

## Future Improvements

With another 2–4 hours:
1. Real-time presence / cursor via Laravel Echo + Pusher
2. Document version history (snapshot on every save)
3. Role-based share permissions (viewer vs. editor)
4. PDF export via `dompdf`
5. Full-text search across documents
