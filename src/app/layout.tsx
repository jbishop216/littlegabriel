import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LittleGabriel - Faith-Based AI Counseling',
  description: 'A faith-based AI counseling application providing spiritual guidance and support.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Basic error handling for chunk loading failures */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(event) {
                if (event.message && (event.message.includes('ChunkLoadError') || event.message.includes('Loading chunk'))) {
                  console.error('Chunk loading error detected, refreshing...');
                  window.location.reload();
                }
              });
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}