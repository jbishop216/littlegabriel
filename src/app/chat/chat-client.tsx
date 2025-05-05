'use client';

import { motion } from 'framer-motion';
import GabrielChat from '@/components/chat/GabrielChat';
import { Card } from '@/components/ui/card';
import { Session } from 'next-auth';
import GlobalLayout from '@/components/GlobalLayout';
import BackgroundDecorator from '@/components/BackgroundDecorator';
import { useTheme } from '@/context/ThemeContext';

export default function ChatClient({ session }: { session: Session }) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Explicitly apply the gradient based on theme - always use gold in the center
  const backgroundClass = isDarkMode 
    ? "bg-black" 
    : "bg-gradient-to-r from-purple-600 via-yellow-300 to-purple-600";
  
  return (
    <div className={backgroundClass}>
      <BackgroundDecorator skipBackground={true} />
      <GlobalLayout>
        <div className="relative min-h-[calc(100vh-12rem)] overflow-hidden">
          <div className="container mx-auto flex flex-col px-4 py-4">
            <motion.div 
              className="mb-4 flex items-center justify-between"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white bg-opacity-30 backdrop-blur-sm text-white shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-7 w-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-white drop-shadow-md">Chat with Gabriel</h1>
                  <p className="text-lg text-white text-opacity-90">
                    Ask me anything about faith, scripture, or seek guidance
                  </p>
                </div>
              </div>
              
              {session?.user && (
                <motion.div 
                  className="hidden items-center space-x-2 text-sm text-white md:flex bg-white bg-opacity-20 backdrop-blur-sm px-3 py-2 rounded-full"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                  </span>
                  <span>
                    Connected as: <span className="font-medium">{session.user.email}</span>
                  </span>
                </motion.div>
              )}
            </motion.div>
            
            {/* Enlarged Chat Interface */}
            <motion.div 
              className="flex-1"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <Card className="overflow-hidden rounded-3xl border border-white border-opacity-20 bg-white bg-opacity-90 backdrop-blur-md shadow-2xl">
                <GabrielChat />
              </Card>
            </motion.div>
            
            <motion.div 
              className="mt-3 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <p className="text-white text-opacity-90 text-sm drop-shadow-md max-w-4xl mx-auto">
                <strong>Privacy Notice:</strong> We value your privacy. None of your chat data or Bible activity is stored or logged by LittleGabriel. 
                Additionally, conversations are processed securely using OpenAI's GPT-4.1-mini model via API, which does not store or use your data for training. 
                Everything you share is kept private and is not saved — by us or OpenAI. This tool is here to help, not to track.
                Your faith journey is your own — we're just here to walk beside you.
              </p>
            </motion.div>
          </div>
        </div>
      </GlobalLayout>
    </div>
  );
}