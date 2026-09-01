# AI Workflow — Ajaia Docs

## Tools Used

- **Antigravity (Claude Sonnet)** — primary AI pair programmer throughout the build
- **Laravel Boost (project-specific rules)** — auto-loaded conventions for this stack

---

## How AI Materially Accelerated This Build

### 1. Requirements decomposition
The assessment prompt is intentionally open-ended ("lightweight collaborative document editor inspired by Google Docs"). I used AI to break this down into a concrete, scoped MVP feature list — distinguishing must-haves from scope traps (real-time collaboration, DOCX parsing, version history).

**Time saved: ~20 minutes of requirements analysis → ~3 minutes**

### 2. Architecture evaluation
AI helped evaluate trade-offs between approaches (REST API vs Inertia controller methods, service layer vs direct controller logic, SQLite vs PostgreSQL). The monolith decision was confirmed quickly.

**Time saved: Would have spent 30+ minutes on this without AI**

### 3. Backend scaffolding
AI generated migrations, models, the full `DocumentController`, and all route definitions. This is primarily boilerplate — the logic is straightforward CRUD + access control, but writing it by hand is slow.

**Time saved: ~40 minutes**

### 4. TipTap integration
AI identified the correct TipTap extensions needed (`StarterKit`, `Underline`, `Placeholder`), the correct import structure, and the `onUpdate` callback pattern for auto-save debouncing.

**Time saved: ~30 minutes of documentation reading**

### 5. Test generation
AI generated the Pest feature tests covering the full access control matrix. All 8 tests passed on the first run.

**Time saved: ~20 minutes**

---

## What AI Got Wrong (and I Changed)

### Rejected: Service layer abstraction
The initial AI suggestion included a separate `DocumentService` class to abstract business logic from the controller. I rejected this.

> "This adds a layer of indirection that has no meaningful benefit at this scope. The controller is 150 lines and handles one domain. The extra class would just be a pass-through wrapper."

### Rejected: REST API approach
AI initially suggested building a separate REST JSON API (`/api/documents`) and consuming it from React with Axios. I rejected this in favor of Inertia controller methods.

> "We're using Inertia.js — the whole point is to avoid building a separate API. Inertia handles the data layer. Introducing a REST API adds a whole serialization/auth layer that Inertia handles for free."

### Modified: Share endpoint
AI first implemented the share action using `router.post()` from Inertia (which triggers a full page visit). I changed this to a `fetch()` call with `X-CSRF-TOKEN` so we can receive the created share object back as JSON and update the modal state without a page reload.

---

## How I Verified Correctness

1. **Automated tests** — 8 Pest feature tests covering: owner access, shared user access, unrelated user block, persistence, share-only-by-owner, and update permissions
2. **Manual flow testing** — ran through all three key flows manually in the browser:
   - Create → Edit → Save → Refresh → Reopen ✓
   - Upload `.txt` file → opens in editor ✓
   - Share with demo user → login as demo → see shared doc ✓
3. **TypeScript build** — `npm run build` with zero type errors confirms frontend is sound
4. **PHP formatting** — `vendor/bin/pint --dirty` run after all PHP changes

---

## AI-Native Engineering Judgment Demonstrated

The most important AI-native judgment call was **not** using AI suggestions blindly:

- Scope cuts were mine (no real-time, no DOCX)
- Architecture decisions were mine (Inertia over REST, monolith over services)
- The share fetch fix was mine (AI's Inertia router approach wouldn't return JSON)

AI accelerated implementation. Engineering judgment drove decisions.
