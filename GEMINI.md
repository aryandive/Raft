# Project Overview: Raft

Raft is a Next.js-based web application designed for stress management and privacy-focused data storage. It features a "Grounding" tool for breathing exercises and a "Vault" for secure data storage using client-side encryption.

## Main Technologies
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database/Auth:** Supabase (@supabase/ssr)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Encryption:** Web Crypto API (AES-GCM 256-bit)
- **Icons:** Lucide React

## Architecture & Core Concepts

### 1. Authentication & Session Management
- **Supabase SSR:** Uses @supabase/ssr for managing sessions across client and server.
- **Middleware:** utils/supabase/middleware.ts handles session updates and route protection.
- **Protected Routes:** /dashboard, /workspace, /onboarding/vault, /onboarding/restore.
- **Public/Guest Routes:** /, /auth, /onboarding/calibration.

### 2. Security & Privacy (The Vault)
- **Client-Side Encryption:** Data is encrypted in the browser before being sent to Supabase.
- **Master Key:** A 256-bit AES-GCM key is generated locally. It can be exported as a Base64 recovery string for the user.
- **Local Storage:** The master key is stored in the browser's IndexedDB (RaftVaultDB) for persistence without compromising server-side security.
- **Payloads:** Encrypted payloads consist of ciphertext and iv (Initialization Vector).

### 3. Features
- **Grounding (/dashboard/grounding):** A breathing sandbox using Framer Motion to guide users through inhalation, holding, and exhalation cycles.
- **Vault:** (Inferred) Secure storage for sensitive information, leveraging the utils/crypto.ts utilities.

## Building and Running

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Development Conventions

### 1. Client vs. Server Components
- Use "use client" directive for components requiring state, effects, or browser-only APIs (like Web Crypto).
- Keep layouts and high-level pages as Server Components when possible for better performance.

### 2. Styling
- Use Tailwind CSS for all styling.
- Follow the established design language: dark backgrounds (#0f172a), serif headings for a calming effect, and soft indigo/sage accents.

### 3. Encryption Workflow
- Never send the master key to the server.
- All encryption/decryption must happen in Client Components or client-side utilities.
- Use utils/crypto.ts for any cryptographic operations.

### 4. Supabase Interaction
- Use createClient() from @supabase/ssr (as defined in utils/supabase/client.ts) to interact with the backend.
- Ensure middleware is updated if new protected routes are added.

## Directory Structure Highlights
- app/: Next.js App Router pages and layouts.
- app/dashboard/: Main application interface, including grounding tools.
- app/onboarding/: User setup flow (calibration, vault setup).
- utils/supabase/: Supabase client and middleware configuration.
- utils/crypto.ts: Core cryptographic logic.
