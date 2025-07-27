# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
- `pnpm dev` - Start development server (automatically runs presource scripts)
- `pnpm build` - Build for production (automatically runs presource scripts)
- `pnpm start` - Start production server with .env.server file
- `pnpm preview` - Preview Cloudflare Pages build locally
- `pnpm test` - Run tests with Vitest

### Code Quality
- `pnpm lint` - Run ESLint for code linting
- `pnpm typecheck` - Type check both Node.js and app TypeScript configurations

### Maintenance
- `pnpm presource` - Generate favicons and process source configurations (runs automatically during dev/build)

## Architecture Overview

This is a **news aggregation platform** built with modern web technologies:

### Tech Stack
- **Frontend**: React 19 + Vite + UnoCSS + TanStack Router
- **Backend**: Nitro server with H3 handlers
- **State Management**: Jotai for client state
- **Database**: db0 with multiple connector support (SQLite, D1, MySQL)
- **Auth**: GitHub OAuth with JWT
- **Deployment**: Cloudflare Pages (primary) or Docker

### Core Architecture

**Monorepo Structure:**
- `shared/` - Common types, utilities, and configurations shared between client/server
- `src/` - React frontend application
- `server/` - Nitro backend with API routes and data sources
- `scripts/` - Build-time utilities for favicon generation and source processing

**Data Flow:**
1. **Sources** (`server/sources/`) - Individual scrapers for news sites (30+ sources)
2. **Getters** (`server/getters.ts`) - Unified interface for fetching and caching
3. **API Routes** (`server/api/`) - REST endpoints serving aggregated data
4. **Frontend** (`src/`) - React components consuming API data

**Key Systems:**
- **Source Management**: Modular scrapers in `server/sources/` with automatic metadata generation
- **Caching Strategy**: 30-minute default cache with adaptive intervals (minimum 2 minutes)
- **Column System**: Configurable news categories with drag-and-drop reordering
- **Real-time Updates**: Server-sent events for live news updates

### Adding New Data Sources

New sources go in `server/sources/[source-name].ts`. Each source must:
1. Export a default function returning `Promise<NewsItem[]>`
2. Be added to `shared/pre-sources.ts` configuration
3. Include proper error handling and rate limiting
4. Follow the `NewsItem` interface from `shared/types.ts`

The build process automatically generates type-safe source IDs and metadata.

### Database Schema

Uses db0 with these main tables:
- `cache` - News item caching with TTL
- `user` - GitHub OAuth user data
- Supports SQLite (development), Cloudflare D1 (production), MySQL

### Environment Configuration

Key environment variables (see `example.env.server`):
- `G_CLIENT_ID` / `G_CLIENT_SECRET` - GitHub OAuth
- `JWT_SECRET` - Token signing
- `INIT_TABLE=true` - Database initialization (first run only)
- `ENABLE_CACHE=true` - Enable caching system

### TypeScript Configuration

Multi-project setup:
- `tsconfig.app.json` - Frontend React app
- `tsconfig.node.json` - Backend Node.js server
- Auto-imports configured for React, Jotai, and custom utilities

### Deployment Considerations

**Cloudflare Pages:**
- Build command: `pnpm run build`
- Output directory: `dist/output/public`
- Requires D1 database binding for persistence

**Local Development:**
- Requires Node.js >= 20
- Uses pnpm for package management
- SQLite database for local development