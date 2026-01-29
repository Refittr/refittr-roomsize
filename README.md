# RoomSize by Refittr

A free tool to find exact room dimensions for UK house types. No measuring required - know if it fits before you buy.

## Overview

RoomSize helps users find the room dimensions for their property by:
1. Searching by postcode or development name
2. Selecting their street
3. Choosing their house type
4. Viewing detailed floor and wall dimensions for each room

## Features

- **Postcode Search**: Find streets by full postcode or postcode area (e.g., "L32" or "L32 9QX")
- **Development Search**: Search by housing development name
- **Floor Dimensions**: Width, length, and calculated floor area for flooring/carpet
- **Wall Dimensions**: Interactive wall calculator with adjustable ceiling height
- **Schema Requests**: Users can request their house type be added
- **Problem Reports**: Users can report incorrect dimensions
- **Analytics Dashboard**: Track searches, views, and user engagement

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page with search
│   ├── streets/page.tsx      # Street selection
│   ├── houses/page.tsx       # House type selection
│   ├── rooms/page.tsx        # Room dimensions display
│   ├── privacy/page.tsx      # Privacy policy
│   ├── admin/page.tsx        # Analytics dashboard
│   ├── not-found.tsx         # 404 page
│   ├── layout.tsx            # Root layout with SEO
│   └── api/
│       ├── search-location/  # Search streets/developments
│       ├── get-houses/       # Get houses for a street
│       ├── get-schema/       # Get schema with rooms
│       ├── schema-request/   # Submit schema request
│       ├── report-problem/   # Submit problem report
│       ├── waitlist-signup/  # Join waitlist
│       ├── analytics/        # Log analytics events
│       └── admin/stats/      # Admin dashboard data
├── components/
│   ├── RoomSizeFooter.tsx    # Footer with waitlist
│   ├── SchemaRequestModal.tsx
│   ├── ProblemReportModal.tsx
│   ├── LoadingSkeleton.tsx   # Loading states
│   └── ErrorState.tsx        # Error handling
├── lib/
│   └── supabase.ts           # Supabase client
└── types/
    └── database.ts           # TypeScript types
```

## Environment Variables

Create a `.env.local` file with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin (optional - defaults to 'roomsize-admin-2024')
ADMIN_KEY=your-admin-key
```

## Database Schema

The app uses these Supabase tables:

### Existing Tables (from Refittr)
- `streets` - Street data with postcode info
- `developments` - Housing development info
- `house_schemas` - House type definitions
- `house_schema_streets` - Links schemas to streets
- `rooms` - Room dimensions for each schema
- `builders` - Builder/developer info

### RoomSize Tables
- `schema_requests` - User requests for new schemas
- `schema_problem_reports` - Problem reports for schemas
- `waitlist_signups` - Email waitlist
- `analytics_events` - Usage analytics

## Setup Instructions

### 1. Clone and Install

```bash
cd refittr-roomsize-app
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and fill in your Supabase credentials.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
npm run start
```

## Deployment to Vercel

### 1. Connect Repository

- Link your GitHub repository to Vercel
- Vercel will auto-detect Next.js settings

### 2. Configure Environment Variables

In Vercel project settings, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_KEY` (optional)

### 3. Configure Domain

Set custom domain: `roomsize.refittr.co.uk`

### 4. Deploy

Push to main branch or trigger manual deployment.

## Admin Dashboard

Access at `/admin?key=YOUR_ADMIN_KEY`

Features:
- Usage statistics (searches, views, signups)
- Schema requests list
- Problem reports list
- Top postcodes searched
- Top house types viewed
- Top rooms viewed
- Date filtering (7d/30d/all time)

## PWA Setup

The app includes PWA manifest for "Add to Home Screen" functionality.

### Generate Icons

Use the SVG at `/public/icon.svg` to generate PNG icons:
- Use a tool like [realfavicongenerator.net](https://realfavicongenerator.net/)
- Generate icons at: 72, 96, 128, 144, 152, 192, 384, 512px
- Place in `/public/icons/`

## Testing Checklist

Before going live:

- [ ] Search by postcode returns results
- [ ] Search by development returns results
- [ ] Street selection navigates to houses
- [ ] House selection navigates to rooms
- [ ] Room expansion shows dimensions
- [ ] Wall calculator updates with ceiling height
- [ ] Schema request form submits
- [ ] Problem report form submits
- [ ] Waitlist signup works
- [ ] Analytics events are logged
- [ ] Admin dashboard loads
- [ ] Mobile responsive on iPhone/Android
- [ ] 404 page displays correctly
- [ ] Loading states show properly
- [ ] Error states display on API failure

## Brand Colors

```css
--refittr-green: #10B981
--refittr-green-dark: #059669
--refittr-navy: #0F172A
--refittr-gray: #64748B
--refittr-light-gray: #94A3B8
--refittr-border: #E2E8F0
--refittr-background: #F8FAFC
```

## License

Proprietary - Refittr Ltd.

## Support

For issues or questions, contact: hello@refittr.co.uk
