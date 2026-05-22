# Spartan.Edu — Real accounts & cloud sync

The app runs in **local demo mode** by default (accounts and data live only in the browser). To support **sign up / login on any device**, **forgot password with email verification codes**, and **synced piano decks & tasks**, use [Supabase](https://supabase.com) (free tier is enough).

## 1. Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and create a project.
2. In **Project Settings → API**, copy:
   - **Project URL**
   - **anon public** key (safe to use in the browser)

## 2. Enable email auth

1. **Authentication → Providers → Email** — keep enabled.
2. **Authentication → Email Templates** — ensure OTP / magic link emails are enabled.
3. For **6-digit codes** on forgot password, Supabase sends OTP tokens when you call `signInWithOtp`. In the dashboard, use the default **Magic Link** template or customize it to show the token/code (see [Supabase OTP docs](https://supabase.com/docs/guides/auth/auth-email-passwordless)).

Optional: turn off **Confirm email** during development so sign-up works immediately (**Authentication → Providers → Email → Confirm email**).

## 3. Create the user data table

In **SQL Editor**, run:

```sql
create table if not exists public.user_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

create policy "Users read own data"
  on public.user_data for select
  using (auth.uid() = user_id);

create policy "Users write own data"
  on public.user_data for insert
  with check (auth.uid() = user_id);

create policy "Users update own data"
  on public.user_data for update
  using (auth.uid() = user_id);
```

This stores decks, projects, key map, and theme per user.

## 4. Connect the app

In `index.html`, find `APP_CONFIG` and set:

```javascript
const APP_CONFIG = {
    backend: 'supabase',
    supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
    supabaseAnonKey: 'YOUR_ANON_KEY'
};
```

Redeploy or refresh the page. The login screen will show **“Cloud accounts enabled”**.

## 5. How flows work

| Feature | Behavior |
|--------|----------|
| **Sign up** | `auth.signUp` + profile in `user_metadata.full_name` |
| **Login** | `auth.signInWithPassword` — same account on phone, tablet, desktop |
| **Session** | Restored on page load via `getSession()` |
| **Data sync** | `user_data` table upserted when you save decks/tasks |
| **Forgot password** | Email → 6-digit OTP → verify → `updateUser({ password })` |

Forgot password **only works when `backend: 'supabase'`** is configured. Local demo mode cannot send real emails.

## 6. Deploying

Host `index.html` on any static host (GitHub Pages, Netlify, Vercel). Add your site URL under **Authentication → URL configuration → Redirect URLs** if you use email confirmation links.

## 7. Alternatives

| Service | Good for |
|--------|----------|
| **Firebase Auth** | Google/email login; Firestore for data |
| **Auth0 / Clerk** | Hosted login UI; needs separate API for app data |
| **Custom Node API** | Full control; you must run email (SendGrid, Resend) and a database |

Supabase matches this single-page app with minimal backend code.

## 8. Security notes

- Never put the **service_role** key in `index.html` — only the **anon** key.
- Row Level Security (above) ensures users only read/write their own `user_data`.
- Passwords are handled by Supabase Auth, not stored in `localStorage`.

## 9. Troubleshooting

- **“Invalid login credentials”** — wrong password or email not confirmed.
- **OTP email not received** — check spam; verify SMTP in Supabase **Project Settings → Auth**.
- **“Could not sync to cloud”** — confirm `user_data` table and RLS policies exist.
- **Code invalid** — codes expire; use **Resend code** within a few minutes.
