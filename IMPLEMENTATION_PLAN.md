# Ajaia Document Editor MVP — Implementation Plan

## What we're building

A polished document editor with: login, document list, rich-text editing (TipTap), auto-save, file import (.txt/.md), and document sharing between seeded users.

## Current State — What's already here

| Already present | What it gives us |
|---|---|
| Laravel 13 + Inertia v3 + React | Full-stack SPA foundation — no setup needed |
| Laravel Fortify | Auth (login/register/logout) — already wired |
| SQLite DB (`database.sqlite`) | No PostgreSQL setup needed |
| Tailwind v4 + Radix UI | Design system ready |
| Wayfinder | Typed route functions for frontend |
| Pest v5 | Testing framework ready |
| `User` model + migrations | Users table exists |

**We are NOT starting from scratch.** The hard setup is done.

---

## What we need to install

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-placeholder
```

No new PHP packages needed.

---

## Database schema

### `documents` table (new migration)
```
id, user_id (FK→users), title, content (text), created_at, updated_at
```

### `document_shares` table (new migration)
```
id, document_id (FK→documents), user_id (FK→users), shared_by (FK→users), created_at
```

---

## Proposed Changes

### 1. Backend — Database & Models

#### [NEW] `create_documents_table` migration
#### [NEW] `create_document_shares_table` migration
#### [NEW] `app/Models/Document.php`
#### [NEW] `app/Models/DocumentShare.php`

---

### 2. Backend — Seeders

#### [MODIFY] `database/seeders/DatabaseSeeder.php`

Seed two fixed users:
- `Mahavishnu` / `mahavishnu@example.com` / `password`
- `Demo User` / `demo@example.com` / `password`

---

### 3. Backend — API Controllers

#### [NEW] `app/Http/Controllers/DocumentController.php`

```
GET    /api/documents          → index (own + shared)
POST   /api/documents          → store
GET    /api/documents/{doc}    → show (auth check)
PUT    /api/documents/{doc}    → update (auth check)
DELETE /api/documents/{doc}    → destroy (owner only)
POST   /api/documents/{doc}/share  → share with user by email
POST   /api/documents/import   → upload .txt/.md file
```

Auth rule: owner = read/write/share/delete. Shared user = read/write only.

#### [MODIFY] `routes/web.php`
Add API routes (still under web middleware for session auth, no sanctum needed since Inertia shares session).

---

### 4. Frontend — Pages

#### [NEW] `resources/js/pages/documents/index.tsx`
Document list: sidebar with "My Documents" + "Shared with me" sections, + New button, upload button.

#### [NEW] `resources/js/pages/documents/show.tsx`
The main editor page:
- Editable title (click to rename)
- TipTap editor with toolbar: B, I, U, H1, H2, Bullet list, Numbered list
- Auto-save (debounced 1.5s) + "Saved ✓" / "Saving..." status
- Share button → modal (enter email → share)
- Top nav with user dropdown (logout)

---

### 5. Frontend — Components

#### [NEW] `resources/js/components/editor/EditorToolbar.tsx`
Toolbar with Bold, Italic, Underline, H1, H2, Bullet, Numbered list buttons.

#### [NEW] `resources/js/components/editor/ShareModal.tsx`
Dialog: email input + Share button + list of people with access.

---

### 6. Tests

#### [NEW] `tests/Feature/DocumentSharingTest.php`

Two meaningful tests:
1. Shared user **can** read & write a document shared with them
2. Unrelated user **cannot** access the document (403)

---

### 7. Documentation

#### [NEW] `README.md`
#### [NEW] `ARCHITECTURE.md`
#### [NEW] `AI_WORKFLOW.md`
#### [NEW] `SUBMISSION.md`

---

## Authorization logic (simple)

```php
// Can view/edit: owner OR shared user
// Can delete/share: owner only
$canAccess = $document->user_id === auth()->id()
    || $document->shares()->where('user_id', auth()->id())->exists();
```

---

## Build order (execute in this sequence)

```
1. npm install TipTap packages
2. Migrations (documents + document_shares)
3. Models (Document + DocumentShare)
4. Seed users
5. DocumentController (all routes)
6. Wire routes/web.php
7. documents/index.tsx (list page)
8. documents/show.tsx (editor page)
9. EditorToolbar component
10. ShareModal component
11. Tests
12. Documentation
```

---

## Open Questions

> [!NOTE]
> No blocking questions — the plan is self-contained. The only decision is whether to use `/api/` prefix or Inertia controller methods.
> **Decision: Use Inertia controller methods (not REST JSON API) since the frontend is Inertia/React, not a separate SPA.**
> This means `DocumentController` returns `Inertia::render()` for show/index, and JSON for update/store/share/import.

## Verification Plan

### Automated Tests
```bash
php artisan test --filter=DocumentSharingTest --compact
```

### Manual Flows
1. Login → Create document → Type → Refresh → Document persists ✓
2. Upload .txt file → Opens in editor ✓
3. Share with demo@example.com → Login as demo → See in "Shared with me" ✓
