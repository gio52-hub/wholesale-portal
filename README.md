# Smart Launch Wholesale Portal

A Next.js application for managing wholesale products, clients, and orders with Airtable as the backend database.

## Features

### Client Portal
- **My Deals** - Browse available products and claim units
- **My Orders** - Track order status and history
- Secure login with email authentication

### Admin Portal
- **Dashboard** - Overview of operations (stats, pending claims, low stock alerts)
- **Products** - View and manage product inventory
- **Clients** - Manage client accounts
- **Client Deals** - View all deals and their status
- **Batch Create** - Create multiple deals for a client at once
- **Claims History** - View all claim records

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: NextAuth.js
- **Database**: Airtable
- **Deployment**: Vercel

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `AIRTABLE_API_KEY` - Your Airtable API key
- `AIRTABLE_BASE_ID` - Your Airtable base ID
- `NEXTAUTH_SECRET` - Random secret for NextAuth (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for development)
- `ADMIN_EMAILS` - Comma-separated list of admin email addresses

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Airtable Setup

The app expects the following tables in your Airtable base:

### Master Inventory
- Product Name, Walmart Link, Walmart Retail Price, Linda's Actual Cost, Walmart Fees
- Units Available, Units Remaining (rollup), Inventory Status (formula)
- Lead Time, Status, Internal Status

### Clients
- Client Name, Contact Email, Company, Phone, Notes

### Client Deals
- Deal ID, Product (link), Client (link), Linda's Selling Price
- Client's Profit, Client's ROI (formulas)
- Claimed Units, Claim Date, Claim Status
- Snapshot fields (Price, Client ROI, etc.)
- Status

### Claims History
- Claim ID, Deal (link), Quantity Claimed, Status
- Lookups for Product Name, Client Name, Snapshot data

## Authentication

- **Admin users**: Any email in the `ADMIN_EMAILS` environment variable
- **Client users**: Any email that exists in the Clients table

Both use the same login page; the app automatically redirects to the appropriate portal based on user role.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Add your environment variables
4. Deploy

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (client)/              # Client portal pages
│   │   ├── deals/             # My Deals
│   │   └── orders/            # My Orders
│   ├── (admin)/               # Admin portal pages
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── clients/
│   │   ├── deals/
│   │   ├── batch-create/
│   │   └── claims/
│   └── api/                   # API routes
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── layout/                # Navbar, Sidebar
│   └── deals/                 # Deal cards, Claim modal
├── lib/
│   ├── airtable.ts            # Airtable client
│   ├── auth.ts                # NextAuth config
│   └── utils.ts               # Utilities
└── types/
    └── index.ts               # TypeScript types
```

## License

Private - Smart Launch 360
