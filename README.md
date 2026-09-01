# Ajaia Docs — Document Editor MVP

A lightweight collaborative document editor built for the Ajaia Full Stack Product Engineer assessment.

## Live Application

> Deployment URL will be added once deployed.

## Test Accounts

| User       | Email                  | Password | Role        |
| ---------- | ---------------------- | -------- | ----------- |
| Mahavishnu | mahavishnu@example.com | password | Owner       |
| Demo User  | demo@example.com       | password | Shared user |

## Features

- **Document creation** — create new documents with a single click
- **Rich-text editing** — Bold, Italic, Underline, H1, H2, H3, Bullet list, Numbered list via TipTap
- **Auto-save** — saves automatically 1.5 seconds after you stop typing, with visible "Saved ✓" status
- **Document rename** — click the title to edit it inline
- **File Import**: Upload a `.txt` or `.md` file and turn it into a new editable document (note: `.docx` and other formats are intentionally unsupported in this MVP for simplicity)
- **Sharing** — share documents with other users by email; owners can read/write/share/delete; shared users can read/write
- **Owned vs shared view** — clear distinction on the documents list page

## Supported Import Formats

`.txt` and `.md` files are supported. Content is extracted and opened in the editor.

## Local Setup

```bash
# Clone and install
git clone https://github.com/mahavishnup/ajaia.git
cd ajaia
composer install
npm install

# Environment
cp .env.example .env
php artisan key:generate

# Database (SQLite)
php artisan migrate:fresh --seed

# Dev server
composer run dev
# or separately:
php artisan serve
npm run dev
```

Then visit: http://localhost:8000

Login with `mahavishnu@example.com` / `password`

## Running Tests

```bash
php artisan test --filter=DocumentSharingTest --compact
```

## Tech Stack

- **Backend**: Laravel 13, PHP 8.4, SQLite
- **Frontend**: React 19, TypeScript, Inertia.js v3
- **Editor**: TipTap (StarterKit + Underline + Placeholder)
- **Styling**: Tailwind CSS v4, Radix UI
- **Auth**: Laravel Fortify
- **Routes**: Laravel Wayfinder (typed route functions)
