import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import ChatClient from './chat-client';

export const metadata: Metadata = {
  title: 'Chat with Gabriel',
  description: 'Have a faithful conversation with our AI assistant',
};

export default async function ChatPage() {
  // Get the session using NextAuth
  const session = await getServerSession(authOptions);
  
  // For production, we'll let the client-side handle authentication checks
  // This prevents the redirect loop issues in production
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  
  if (!isProduction && !session?.user) {
    // In development, redirect if no NextAuth session
    // The client-side authentication will handle direct auth users
    redirect('/login?callbackUrl=/chat&checkDirectAuth=true');
  }
  
  // Pass the session if available, otherwise create a placeholder session
  const effectiveSession = session || {
    user: { 
      id: 'direct-auth-user',
      email: 'authenticated-user@direct-auth',
      role: 'user',
      name: 'Direct Auth User'
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
  };
  
  // Render the chat client with the effective session
  return <ChatClient session={effectiveSession as any} />;
}