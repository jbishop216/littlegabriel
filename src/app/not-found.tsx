import Link from 'next/link';

// Skip static generation for this page to avoid Invalid URL errors
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-6 max-w-md text-lg">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link 
        href="/"
        className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
      >
        Return Home
      </Link>
    </div>
  );
}