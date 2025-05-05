'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LittleGabrielLanding() {
  return (
    <div className="relative font-sans min-h-screen overflow-hidden">
      {/* Background is now handled by PageBackground component in LandingPage */}
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <header className="text-center mb-12">
          <motion.h1
            className="text-6xl font-extrabold text-white drop-shadow-md mb-4 leading-tight"
            initial={{ scale: 0.8, y: -50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            LittleGabriel
          </motion.h1>
          <motion.p
            className="text-2xl text-yellow-50 font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Providing Spiritual Guidance and Faith-Based Support
          </motion.p>
        </header>

        {/* Feature Cards */}
        <section className="grid md:grid-cols-4 gap-8 mb-16">
          {[
            {
              icon: (
                <svg
                  width="48"
                  height="48"
                  fill="none"
                  stroke="#0d9488" /* teal */
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow"
                >
                  {/* MessageCircle icon from Lucide */}
                  <path d="M21 11.5a8.38 8.38 0 0 1-9 8.4 8.5 8.5 0 0 1-5-.8L2 20l1.27-3.8a8.5 8.5 0 0 1-.77-3.7 8.38 8.38 0 0 1 9-8.4 8.5 8.5 0 0 1 8.5 8.5z"></path>
                </svg>
              ),
              title: 'Chat with Gabriel',
              description: 'Compassionate guidance on life\'s challenges from a biblical perspective',
              link: '/chat'
            },
            {
              icon: (
                <svg
                  width="48"
                  height="48"
                  fill="none"
                  stroke="#f59e0b" /* bright yellow */
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow"
                >
                  {/* HeartHandshake icon from Lucide (approx) */}
                  <path d="M12 20.88l-3.76-3.47a5.13 5.13 0 0 0-6.65-.25 4.42 4.42 0 0 0 0 6.3l10.41 9.61a2.46 2.46 0 0 0 3.28 0l10.41-9.61a4.42 4.42 0 0 0 0-6.3 5.13 5.13 0 0 0-6.65.25L12 20.88z"></path>
                </svg>
              ),
              title: 'Prayer Community',
              description: 'Share your prayer requests and connect with a supportive community of believers',
              link: '/prayer-requests'
            },
            {
              icon: (
                <svg
                  width="48"
                  height="48"
                  fill="none"
                  stroke="#0ea5e9" /* sky blue */
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow"
                >
                  {/* Church icon */}
                  <path d="M12 3L2 12h3v8h14v-8h3L12 3z"></path>
                  <path d="M9 21v-8h6v8"></path>
                </svg>
              ),
              title: 'Sermon Generator',
              description: 'Create insightful sermon content based on scripture with AI assistance',
              link: '/sermon-generator'
            },
            {
              icon: (
                <svg
                  width="48"
                  height="48"
                  fill="none"
                  stroke="#3490dc" /* bright blue */
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow"
                >
                  {/* Book Open icon from Lucide, but manually inserted if needed */}
                  <path d="M2 4h6a2 2 0 0 1 2 2v14H2z"></path>
                  <path d="M22 4h-6a2 2 0 0 0-2 2v14h8z"></path>
                </svg>
              ),
              title: 'Bible Study',
              description:
                'Access Scripture with interactive tools and in-depth study resources',
              link: '/bible-reader'
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <Link href={item.link}>
                <Card className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden cursor-pointer h-full">
                  <CardContent className="p-8 text-center flex flex-col items-center">
                    {item.icon}
                    <h2 className="mt-4 mb-2 text-2xl font-bold text-blue-900">
                      {item.title}
                    </h2>
                    <p className="text-gray-700 font-medium">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </section>

        {/* Call to Action */}
        <motion.section
          className="relative text-center rounded-3xl p-8 bg-white/70 shadow-2xl"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-extrabold text-blue-900 drop-shadow-lg mb-4">
            Begin Your Spiritual Growth Journey
          </h2>
          <p className="text-blue-900 text-lg font-semibold mb-6">
            LittleGabriel offers guidance and support for your walk of faith
          </p>
          <Link href="/chat">
            <Button 
              variant="primary" 
              size="xl"
              className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold rounded-lg shadow-lg transform hover:-translate-y-1 transition-all"
            >
              Get Started
            </Button>
          </Link>
        </motion.section>
      </div>
    </div>
  );
}