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
  const session = await getServerSession(authOptions);
  
  // Redirect to login if no session
  if (!session?.user) {
    redirect('/login?callbackUrl=/chat');
  }
  
  return <ChatClient session={session} />;
}