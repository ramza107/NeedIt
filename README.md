# MakeIt — Custom Orders Marketplace

MakeIt is a marketplace where buyers post custom order requests and skilled makers compete with offers. Payment is protected until the buyer approves the finished work.

## Features (MVP)

- **Landing page** with hero, how-it-works, categories, and featured makers
- **Registration/Login** with buyer and maker roles
- **Buyer flow**: create requests, upload photos, view offers, select maker, pay via Stripe, chat, accept work, leave reviews
- **Maker flow**: browse requests, make offers, manage orders, upload completed work, receive payment
- **Protected payments** via Stripe Checkout (test mode)
- **Real-time chat** via Supabase Realtime
- **Order status tracking** through the full lifecycle
- **Disputes** and admin dashboard
- **Profiles** with ratings and reviews

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime, RLS)
- **Payments**: Stripe Checkout

## Setup

### 1. Clone and install

```bash
npm install
cp .env.local.example .env.local
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL migration in `supabase/migrations/001_initial_schema.sql` via the SQL Editor
3. Create storage buckets: `request-images`, `portfolio`, `completions`, `avatars`, `chat-attachments` (all public)
4. Copy your project URL and anon key to `.env.local`
5. Enable Email auth in Authentication → Providers

### 3. Stripe (test mode)

1. Create an account at [stripe.com](https://stripe.com)
2. Copy test API keys to `.env.local`
3. For webhooks locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## User Flow

```
Buyer posts request → Makers submit offers → Buyer selects maker
→ Payment secured (Stripe) → Maker produces → Buyer reviews & accepts
→ Payment released → Reviews
```

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── auth/             # Login & registration
│   ├── dashboard/        # Role-based dashboard
│   ├── requests/         # Create & browse requests
│   ├── orders/           # Order management
│   ├── profile/          # User profiles
│   ├── maker/setup/      # Maker onboarding
│   ├── admin/            # Admin dashboard
│   └── api/stripe/       # Payment API routes
├── components/           # React components
├── lib/                  # Utilities, Supabase, Stripe
└── types/                # TypeScript types
supabase/
└── migrations/           # Database schema
```

## Admin Access

Set a user's role to `admin` in the `profiles` table to access `/admin`.

## Platform Fee

Default commission: **10%** per transaction (configurable in `src/lib/constants.ts`).
