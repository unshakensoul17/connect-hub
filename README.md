# Connect Hub

A modern campus platform for students to share notes, ask questions, and collaborate. Built with Next.js, Supabase, and Meilisearch.

## Features

- 📚 **Notes Library** - Share and discover study materials with fast, typo-tolerant search
- ❓ **Q&A Forum** - Ask questions and get answers from peers
- 🏆 **Leaderboard** - Gamified contribution system with points
- ⭐ **Reviews & Ratings** - Rate and review notes
- 🔍 **Advanced Search** - Powered by Meilisearch for instant, relevant results

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS 4
- **Backend**: Supabase (PostgreSQL + Auth)
- **Search**: Meilisearch
- **UI Components**: Radix UI, Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for Meilisearch)
- Supabase account

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd campus-connect
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_MASTER_KEY=campus_connect_master_key_2026

# For real-time webhook sync
WEBHOOK_SECRET=<generate with: openssl rand -hex 32>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate webhook secret:
```bash
openssl rand -hex 32
```


4. Start Meilisearch
```bash
docker-compose up -d
```

5. Run the development server
```bash
npm run dev
```

6. Initialize Meilisearch index and sync data
```bash
# In a new terminal
curl -X POST http://localhost:3000/api/meilisearch/sync
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Meilisearch Integration

This project uses Meilisearch for fast, typo-tolerant search on notes. See [MEILISEARCH_SETUP.md](./MEILISEARCH_SETUP.md) for detailed setup and usage instructions.

### Key Search Features

- ⚡ **Sub-50ms search times**
- 🔤 **Typo tolerance** - finds results despite spelling mistakes
- 🎯 **Relevance scoring** - best matches first
- 🏷️ **Faceted filtering** - filter by subject, tags, etc.
- ✨ **Highlighted results** - see exactly what matched

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── search/       # Search endpoints
│   │   └── meilisearch/  # Sync endpoints
│   ├── dashboard/        # Main app pages
│   └── (auth)/           # Authentication pages
├── components/            # React components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── meilisearch/     # Meilisearch integration
│   ├── api.ts           # Supabase API layer
│   └── supabase.ts      # Supabase client
└── types/               # TypeScript types
```

## Database Setup

See [DATABASE_SETUP_GUIDE.md](./DATABASE_SETUP_GUIDE.md) for Supabase schema and setup instructions.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Meilisearch Documentation](https://www.meilisearch.com/docs)

## Deploy

### Vercel (Frontend)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Meilisearch (Search)

- **Recommended**: Use [Meilisearch Cloud](https://www.meilisearch.com/cloud) free tier
- **Alternative**: Self-host on Railway, Render, or any container platform
