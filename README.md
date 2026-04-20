# Claude Fan-Made

A fan-made AI assistant inspired by Claude, built with Next.js 14, Supabase, and OpenRouter.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Auth**: NextAuth.js (Google, GitHub, Email/Password)
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenRouter API (free models)
- **UI**: Tailwind CSS + Framer Motion
- **Deploy**: Render.com

## Models

| Fan-Made Name | Real Model |
|---|---|
| Claude Fan-Made Haiku | meta-llama/llama-3.1-8b-instruct:free |
| Claude Fan-Made 4.6 | meta-llama/llama-3.3-70b-instruct:free |
| Claude Fan-Made 4.7 | google/gemini-2.0-flash-exp:free |
| Claude Fan-Made 4.6 Opus | deepseek/deepseek-chat-v3-0324:free |
| Claude Fan-Made 4.6 Opus (Thinking) | deepseek/deepseek-r1:free |

## Setup

### 1. Clone & Install

```bash
git clone <repo>
cd claude-fan-made
npm install
```

### 2. Supabase

1. Create project at supabase.com
2. Run `supabase/schema.sql` in SQL editor
3. Copy URL and anon key

### 3. OAuth

**Google**: console.cloud.google.com > Credentials > OAuth 2.0
**GitHub**: github.com/settings/developers > OAuth Apps

### 4. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values.

### 5. Run locally

```bash
npm run dev
```

## Deploy to Render

1. Push to GitHub
2. Create new **Web Service** on render.com
3. Connect your repo
4. Set **Build Command**: `npm install && npm run build`
5. Set **Start Command**: `npm start`
6. Add all environment variables from `.env.example`
7. Set `NEXTAUTH_URL` to your Render URL
8. Set `NEXT_PUBLIC_APP_URL` to your Render URL

## Features

- Multi-model chat with streaming
- Zip file extraction and file tree viewer
- Cross-session memory via Supabase
- Per-user API key management
- Live model import from OpenRouter
- Google & GitHub OAuth
- Collapsible sidebar with chat history
- Thinking model support (DeepSeek R1)
- Markdown rendering with syntax highlighting
- Responsive design
