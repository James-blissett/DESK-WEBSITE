# Standing Desk Website

A Next.js 14 e-commerce website for selling standing desks.

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **DaisyUI** as Tailwind component library
- **Supabase** for backend services
- **Stripe** for payments
- **Resend** for transactional emails

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Copy the environment variables template:
```bash
cp .env.local.example .env.local
```

3. Fill in your environment variables in `.env.local`:

   **Required for basic functionality:**
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL (found in Settings → API)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key (found in Settings → API)
   
   **Recommended for Stripe webhooks:**
   - `SUPABASE_SERVICE_ROLE_KEY` - Required for Stripe webhooks to update order status in the database. **Keep this secret!** Never expose it in client-side code. Found in Settings → API → service_role key (secret).
   
   **Optional (only needed for specific features):**
   - `STRIPE_SECRET_KEY` - Needed for payment processing
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Needed for payment processing
   - `RESEND_API_KEY` - Needed for sending transactional emails
   - `NEXT_PUBLIC_META_PIXEL_ID` - Your Meta Pixel ID for Facebook/Meta advertising tracking (e.g., `984883318036668`)
   
   **Note about Supabase keys:** The `anon` key is safe to use in client-side code and respects Row-Level Security (RLS). The `service_role` key bypasses all RLS policies and should ONLY be used server-side for admin operations.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/             # Reusable React components
├── lib/                    # Utility functions and API clients
│   ├── supabase.ts
│   ├── stripe.ts
│   └── resend.ts
└── types/                  # TypeScript type definitions
    └── index.ts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
