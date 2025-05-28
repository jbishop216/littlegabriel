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
  
  // If no NextAuth session, redirect to login
  // The client-side authentication will handle direct auth users
  if (!session?.user) {
    // Add a special query parameter to indicate we should check for direct auth
    redirect('/login?callbackUrl=/chat&checkDirectAuth=true');
  }
  
  // We have a valid NextAuth session, render the chat client
  return <ChatClient session={session} />;
}