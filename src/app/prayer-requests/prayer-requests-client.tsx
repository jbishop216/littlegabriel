'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Session } from 'next-auth';
import PrayerRequestForm from '@/components/prayer/PrayerRequestForm';
import PrayerRequestList from '@/components/prayer/PrayerRequestList';
import Link from 'next/link';
import GlobalLayout from '@/components/GlobalLayout';
import BackgroundDecorator from '@/components/BackgroundDecorator';
import { useTheme } from '@/context/ThemeContext';

export default function PrayerRequestsClient({ session }: { session: Session }) {
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showMyRequests, setShowMyRequests] = useState(false);
  const [showCommunityPrayers, setShowCommunityPrayers] = useState(false);
  const isAdmin = session?.user?.role === 'admin';

  const handleSubmitPrayerRequest = async (data: { title: string; content: string; isAnonymous: boolean }) => {
    try {
      const response = await fetch('/api/prayer-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit prayer request');
      }
      
      setSubmissionSuccess(true);
      setShowForm(false);
      setTimeout(() => {
        setSubmissionSuccess(false);
      }, 4000);
    } catch (error) {
      console.error('Error submitting prayer request:', error);
      throw error;
    }
  };

  const handleDeleteRequest = async (id: string): Promise<boolean | void> => {
    try {
      const response = await fetch(`/api/prayer-requests/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete prayer request');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting prayer request:', error);
      throw error;
    }
  };

  const resetView = () => {
    setShowForm(false);
    setShowMyRequests(false);
    setShowCommunityPrayers(false);
  };

  const prayerRequestsContent = (
    <div className="relative min-h-[calc(100vh-12rem)] overflow-hidden">
      <div className="container mx-auto flex flex-col px-4 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8 text-center"
          initial={{ scale: 0.9, y: -20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-md mb-4">Prayer Requests</h1>
          <p className="text-lg md:text-xl text-yellow-50 font-medium max-w-2xl mx-auto">
            Share your prayer needs and join others in prayer for spiritual support and guidance.
          </p>
        </motion.div>
        
        {/* Success message after submission */}
        {submissionSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-green-100 bg-opacity-90 text-green-800 rounded-xl text-center max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-medium">Your prayer request has been submitted successfully! It will be reviewed by our team.</p>
            </div>
          </motion.div>
        )}
        
        {/* Admin info banner - only show this if we're on the main view */}
        {isAdmin && !showForm && !showMyRequests && !showCommunityPrayers && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Card className="bg-indigo-50 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden max-w-4xl mx-auto border-2 border-indigo-200">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="rounded-full bg-indigo-100 p-2 flex-shrink-0 mr-4 mb-3 md:mb-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-grow text-center md:text-left">
                    <h2 className="text-md font-semibold text-indigo-800">Admin Note</h2>
                    <p className="text-indigo-700 text-sm">As an admin, you can manage prayer requests in the admin dashboard.</p>
                  </div>
                  <div className="mt-3 md:mt-0 md:ml-4">
                    <Link href="/admin" passHref>
                      <Button 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg px-4 py-1.5 text-sm"
                      >
                        Admin Dashboard
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Main content - shows by default if no other views are active */}
        {!showForm && !showMyRequests && !showCommunityPrayers && (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Submit Prayer card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="rounded-full bg-purple-100 p-3 w-14 h-14 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-purple-800 mb-2">Submit a Prayer Request</h3>
                  <p className="text-gray-600 mb-6 flex-grow">Share your prayer needs with our community for spiritual support.</p>
                  <Button 
                    onClick={() => {
                      resetView();
                      setShowForm(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg w-full"
                  >
                    Create Request
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* View My Requests card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="rounded-full bg-blue-100 p-3 w-14 h-14 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-blue-800 mb-2">My Prayer Requests</h3>
                  <p className="text-gray-600 mb-6 flex-grow">View and manage your personal prayer requests.</p>
                  <Button 
                    onClick={() => {
                      resetView();
                      setShowMyRequests(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg w-full"
                  >
                    View My Requests
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Community Prayers card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="rounded-full bg-yellow-100 p-3 w-14 h-14 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-yellow-800 mb-2">Community Prayers</h3>
                  <p className="text-gray-600 mb-6 flex-grow">View prayer requests from the community and join in prayer.</p>
                  <Button 
                    onClick={() => {
                      resetView();
                      setShowCommunityPrayers(true);
                    }}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg w-full"
                  >
                    View Community Prayers
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
        
        {/* Prayer request form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto w-full"
          >
            <div className="mb-4">
              <Button
                onClick={resetView}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white mb-4"
              >
                ← Back to Prayer Requests
              </Button>
            </div>
            <PrayerRequestForm onSubmit={handleSubmitPrayerRequest} />
            <div className="mt-6 text-center">
              <p className="text-white text-opacity-90 bg-purple-900 bg-opacity-30 backdrop-blur-sm rounded-lg p-4 inline-block">
                Your prayer request will be reviewed before being shared with the community.
                <br />
                For urgent matters, please contact your local church directly.
              </p>
            </div>
          </motion.div>
        )}
        
        {/* My Prayer Requests */}
        {showMyRequests && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto w-full"
          >
            <div className="mb-4">
              <Button
                onClick={resetView}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white mb-4"
              >
                ← Back to Prayer Requests
              </Button>
            </div>
            <Card className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-blue-800 mb-4">My Prayer Requests</h2>
                <PrayerRequestList 
                  session={session} 
                  onDelete={handleDeleteRequest}
                  viewType="personal"
                />
                <div className="mt-6 text-center">
                  <Button
                    onClick={() => {
                      resetView();
                      setShowForm(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg"
                  >
                    Submit a New Prayer Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Community Prayer Requests */}
        {showCommunityPrayers && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto w-full"
          >
            <div className="mb-4">
              <Button
                onClick={resetView}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white mb-4"
              >
                ← Back to Prayer Requests
              </Button>
            </div>
            <Card className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-yellow-800 mb-4">Community Prayer Requests</h2>
                <p className="text-gray-600 mb-6">Join in prayer with others in our community. These prayer requests have been approved for sharing.</p>
                <PrayerRequestList 
                  session={session} 
                  filter="approved"
                  viewType="community"
                />
                <div className="mt-6 text-center">
                  <Button
                    onClick={() => {
                      resetView();
                      setShowForm(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg"
                  >
                    Submit Your Own Prayer Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );

  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Explicitly apply the gradient based on theme - always use gold in the center
  const backgroundClass = isDarkMode 
    ? "bg-black" 
    : "bg-gradient-to-r from-amber-600 via-yellow-300 to-amber-600";
  
  return (
    <div className={backgroundClass}>
      <BackgroundDecorator skipBackground={true} />
      <GlobalLayout>
        {prayerRequestsContent}
      </GlobalLayout>
    </div>
  );
}