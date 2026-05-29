# Premium Upgrade Plan

This is a large multi-feature upgrade. Below is what I will ship, grouped by area. Approve and I'll implement.

## 1. Lovable Cloud + Authentication

Enable Lovable Cloud (Supabase under the hood) and add a full auth system:

- Email/password (signup, login, reset password)
- Google sign-in (via Lovable broker)
- Apple sign-in (via Lovable broker)
- Logout
- Delete account permanently (server function calling admin API)
- Protected routes under `_authenticated` layout
- `/login`, `/signup`, `/reset-password`, `/conta` (account) pages
- "Profile" entry in settings with avatar + email + delete button

> Note: I will ask you for confirmation about a `profiles` table before writing migrations.

## 2. Cloud Sync (Supabase)

Schema (all RLS-protected, scoped to `auth.uid()`):

- `profiles` — display name, avatar, theme, bible_translation, font_size
- `favorite_verses` — book/chapter/verse/text
- `favorite_hymns` — hymn_id
- `notes` — title, content, category (migrate from localStorage)
- `sermons` — saved AI sermon plans (new schema, see §4)
- `saved_studies` — legacy "Estudos" entries
- `reading_history` — last book/chapter/timestamp
- `devotional_progress` — completed days

Strategy: replace `useLocalStorage` data hooks with TanStack Query + serverFn hooks (`useFavorites`, `useNotes`, etc.). On first login, migrate any existing localStorage data into cloud (one-shot).

## 3. Theme System (Light / Dark)

- `ThemeProvider` with `light` / `dark` / `system`
- Toggle in header + settings
- Persisted in `profiles.theme` (cloud) and localStorage (offline fallback)
- Smooth transition (CSS variables on `:root` and `.dark`)
- Tune existing tokens in `src/styles.css` for both modes

## 4. AI Sermon Assistant (replaces video transcription flow)

New form-based generator at `/estudos`:

Inputs: title, theme, main subject, objective, duration (min), audience (optional).

Server function `generateSermon` → Lovable AI Gateway (`google/gemini-3-flash-preview`) with structured tool-calling output:

```
{
  introduction: { hook, context },
  development: { points: [{title, explanation, application, verses[]}] },
  verses: [{ref, text, why}],
  conclusion: { reflection, callToAction },
  worship: { harpa: [{number, title}], songs: [string] },
  timeline: [{from, to, topic}],
  prayers: { opening, closing, altarCall }
}
```

Features: save / edit / favorite / export (TXT + PDF via print) / personal notes. Stored in `sermons` table.

The old "paste a YouTube link" transcription flow is removed.

## 5. Denominações fixes

- Verify clicking opens detail page (currently has `denominacoes.$id.tsx`)
- Ensure detail page displays: name, foundation year, founders, summary, HQ, history, expansion, Brazil presence, curiosities
- Add any missing fields to `denominacoes-data.ts`

## 6. Bible

No structural changes. Move translation preference from localStorage to `profiles.bible_translation` (with localStorage fallback when logged out). Switcher, ARC, NVI, chapter/verse navigation kept as-is.

## Technical notes

- All Supabase access via `createServerFn` with `requireSupabaseAuth` (RLS-scoped). Admin client only for `delete account`.
- `attachSupabaseAuth` middleware verified in `src/start.ts`.
- All browser-only APIs (speech, localStorage) stay client-gated.
- New routes use the `_authenticated` layout where appropriate.

## Out of scope (call out)

- Real-time multi-device push sync (data syncs on query refetch/auth events, not via realtime channels)
- Native mobile Apple/Google SDKs — uses web OAuth via Lovable broker
- PDF export uses browser print-to-PDF, not a server-side renderer

## Questions before I start

1. Do you want a `profiles` table (display name, avatar, preferences)? I recommend yes.
2. Confirm: remove the old YouTube/Instagram transcription flow entirely, replaced by the form-based sermon generator? (You can keep saved old studies, but no new ones.)
3. Apple Sign-In requires an Apple Developer account configured in Lovable Cloud auth providers. OK to enable email + Google now and add Apple once you confirm provider config is ready?

This is roughly 25–35 files of changes. Once approved I'll batch the work.