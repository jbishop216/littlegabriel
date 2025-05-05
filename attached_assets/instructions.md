# Instructions for Cascade: Recreating the LittleGabriel Project

## Objective

Recreate the LittleGabriel faith-based AI counseling application using Next.js (App Router), prioritizing the accurate replication of the existing chat functionality and user authentication flow.

## Core Technologies

*   **Framework:** Next.js 14+ (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Database ORM:** Prisma
*   **Database:** SQLite (development), PostgreSQL/MySQL (production)
*   **Authentication:** NextAuth.js v5 (`next-auth@next`)
*   **AI/Chat:** Vercel AI SDK (`@vercel/ai`), OpenAI (`openai`)
*   **Password Hashing:** `bcryptjs`

## Instructions

Follow these steps sequentially. I (the USER) will provide the contents of "preserved code" files when you reach the relevant step.

### 1. Project Setup

*   Create a new Next.js project:
    ```bash
    npx create-next-app@latest littlegabriel-rebuild --typescript --tailwind --eslint --app
    cd littlegabriel-rebuild
    ```
*   Remove default placeholder content from `src/app/page.tsx` and [src/app/layout.tsx](cci:7://file:///Users/jamesbishop/Projects/littleGabriel%2032525/src/app/layout.tsx:0:0-0:0).

### 2. Install Dependencies

*   Install primary dependencies:
    ```bash
    npm install next-auth@next @prisma/client @vercel/ai openai bcryptjs
    npm install -D prisma @types/bcryptjs
    ```
    *_(Note: Also consider `react-hook-form` and `zod` for form handling if desired)_*

### 3. Configure Prisma

*   Initialize Prisma:
    ```bash
    npx prisma init --datasource-provider sqlite
    ```
*   **USER ACTION:** Provide the contents of the existing `prisma/schema.prisma` file.
*   Use the provided content to update the newly created `prisma/schema.prisma`.
    *   **Ensure:** Models for `User` (with email, password hash, role), `Session`, `Account`, `VerificationToken` (NextAuth requirements), and any chat-related models are present. Email should be unique.
*   Generate Prisma client and run initial migration:
    ```bash
    npx prisma generate
    npx prisma migrate dev --name init
    ```
*   Create Prisma client instance file (`src/lib/prisma.ts`).

### 4. Implement Authentication (NextAuth.js v5)

*   Create `src/lib/auth.ts`:
    *   Define `authOptions` using `NextAuthOptions`.
    *   Configure `CredentialsProvider`:
        *   Implement the `authorize` function:
            *   Accept `email` and `password`.
            *   **Crucial:** Perform a case-insensitive lookup for the user by email (convert input email to lowercase before querying).
            *   Use `bcryptjs.compare` to validate the password against the stored hash.
            *   Return the user object (without password hash) on success, `null` on failure.
    *   Add necessary `adapter`: `PrismaAdapter(prisma)`.
    *   Configure `session` strategy: `jwt`.
    *   Define `callbacks` if needed (e.g., to add user role/ID to the session token/object).
    *   Set `secret` (using `NEXTAUTH_SECRET` env var).
    *   Configure `pages` if using custom login page (e.g., `signIn: '/login'`).
*   Create the API route handler `src/app/api/auth/[...nextauth]/route.ts`:
    *   Import `authOptions`.
    *   Export `GET` and `POST` handlers from `NextAuth(authOptions)`.
*   Create the Login Page (`src/app/(auth)/login/page.tsx`):
    *   Implement a form with email and password fields.
    *   On submit, call `signIn('credentials', { email, password, redirect: false })`.
    *   Handle loading states and display errors returned from `signIn`.
*   Wrap the root layout ([src/app/layout.tsx](cci:7://file:///Users/jamesbishop/Projects/littleGabriel%2032525/src/app/layout.tsx:0:0-0:0)) with a `SessionProvider` component (`src/components/SessionProvider.tsx`) to make session data available.

### 5. Implement Site Password Gate

*   Create `PasswordContext` (`src/context/PasswordContext.tsx`) using `React.createContext` and `useState` to manage authentication state (`isAuthenticated`, `setIsAuthenticated`).
*   Create `PasswordProtection.tsx` component (`src/components/PasswordProtection.tsx`):
    *   Displays a form asking for the site password.
    *   On submit, compares the entered password with the hashed password from `SITE_PASSWORD_HASH` env var using `bcryptjs.compare`.
    *   If valid, calls `setIsAuthenticated(true)` from the context.
*   Create `SiteProtectionWrapper.tsx` component (`src/components/SiteProtectionWrapper.tsx`):
    *   Consumes `PasswordContext`.
    *   Uses `usePathname` from `next/navigation`.
    *   Defines `EXEMPT_ROUTES`: `['/api', '/login', '/register', ...]`. **Crucially includes `/api` to exempt all API routes.**
    *   Logic:
        *   If `pathname` starts with `/api`, render `children`.
        *   If `isAuthenticated` is true, render `children`.
        *   If `pathname` is in `EXEMPT_ROUTES`, render `children`.
        *   Otherwise, render `<PasswordProtection />`.
*   Wrap the main content area within the root layout ([src/app/layout.tsx](cci:7://file:///Users/jamesbishop/Projects/littleGabriel%2032525/src/app/layout.tsx:0:0-0:0)) with `<PasswordProvider>` and `<SiteProtectionWrapper>`. Ensure Providers are nested correctly (e.g., `PasswordProvider` inside `ThemeProvider`, `SessionProvider` potentially outermost).

### 6. Implement Chat Feature

*   Create OpenAI client setup file (`src/lib/openai.ts`).
*   Create the Chat API Route (`src/app/api/chat/route.ts`):
    *   **USER ACTION:** Provide the contents of the existing `src/app/api/chat/route.ts`.
    *   Use the provided code to implement the route handler. Ensure it uses Vercel AI SDK (`StreamingTextResponse`) and interacts with the OpenAI client. Secure the endpoint (check user authentication).
*   Create the Chat Page (`src/app/chat/page.tsx`):
    *   **USER ACTION:** Provide the contents of the existing `src/app/chat/page.tsx`.
    *   **USER ACTION:** Provide the contents of any custom components imported by `chat/page.tsx` (e.g., `ChatInterface`, `MessageBubble` likely located in `src/components/chat/`).
    *   Use the provided code to implement the page and its components. Ensure it uses the `useChat` hook from `@vercel/ai/react` and interacts with the `/api/chat` endpoint. Protect this page (require authentication).

### 7. Basic Layout & Configuration

*   Implement basic `Navbar` and `Footer` components (`src/components/`).
*   Implement `ThemeProvider` (`src/context/ThemeContext.tsx`) for dark/light mode switching if desired.
*   Configure `tailwind.config.ts` as needed.
*   Configure `next.config.js` (e.g., add security headers if replicating from the old project).

### 8. Environment Variables (`.env.local`)

*   Define the following variables:
    ```dotenv
    DATABASE_URL="file:./dev.db"
    NEXTAUTH_SECRET="YOUR_STRONG_SECRET" # Generate via openssl rand -base64 32
    NEXTAUTH_URL="http://localhost:3000"
    OPENAI_API_KEY="YOUR_OPENAI_KEY"
    SITE_PASSWORD_HASH="BCRYPT_HASH_OF_SITE_PASSWORD" # Hash of "4Me2know@!"
    ```

### 9. Admin User Creation

*   Create a script (`scripts/create-admin.ts` or `seed.ts`) using Prisma client:
    *   Takes email and password as arguments or uses predefined values.
    *   Hashes the password using `bcryptjs.hash`.
    *   Uses `prisma.user.upsert` or `create` to add/update the admin user with an 'ADMIN' role.
    *   Add script execution command to `package.json` (e.g., `npm run seed`).

### 10. Testing

*   Thoroughly test authentication (login, logout, session persistence).
*   Test site password gate (access, exemptions).
*   Test chat functionality (sending messages, receiving streamed responses).
