# LittleGabriel - Faith-Based AI Counseling

LittleGabriel is a Next.js application providing faith-based AI counseling with interactive biblical study experiences and advanced technological integration.

## Features

- **Chat Interface**: Interact with AI that provides faith-based counseling
- **Bible Reader**: Read and search through different Bible translations
- **Sermon Generator**: Create sermon outlines based on Bible passages and themes
- **Prayer Requests**: Submit and manage prayer requests
- **Admin Console**: Manage users and content

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **AI Integration**: OpenAI GPT-4o-mini
- **Bible API**: scripture.API.Bible integration

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables (see `.env.example` for required variables)
4. Run the development server:
   ```
   npm run dev
   ```

## Environment Variables

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key
- `BIBLE_API_KEY`: scripture.API.Bible API key
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `NEXTAUTH_URL`: URL for NextAuth.js

## License

[MIT](LICENSE)