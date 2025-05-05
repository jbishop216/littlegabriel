'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Session } from 'next-auth';

interface PrayerRequest {
  id: string;
  title: string;
  content: string;
  isAnonymous: boolean;
  status: string;
  createdAt: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface PrayerRequestListProps {
  session: Session;
  filter?: string;
  onDelete?: (id: string) => Promise<boolean | void>;
  viewType?: 'personal' | 'community' | 'admin';
}

export default function PrayerRequestList({ session, filter = 'approved', onDelete, viewType = 'admin' }: PrayerRequestListProps) {
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  const isAdmin = session?.user?.role === 'admin';

  useEffect(() => {
    const fetchPrayerRequests = async () => {
      setLoading(true);
      try {
        // Build the query parameters based on viewType
        let queryParams = '';
        
        if (viewType === 'community') {
          // Community view shows only approved requests
          queryParams = '?status=approved';
        } else if (viewType === 'personal') {
          // Personal view shows the user's own requests (all statuses)
          queryParams = ''; // The API will automatically filter by user ID
        } else if (viewType === 'admin') {
          // Admin view shows all requests or filtered by status
          queryParams = filter ? `?status=${filter}` : '';
        }
        
        const response = await fetch(`/api/prayer-requests${queryParams}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch prayer requests');
        }
        
        const data = await response.json();
        setPrayerRequests(data);
      } catch (err) {
        console.error('Error fetching prayer requests:', err);
        setError('An error occurred while fetching prayer requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrayerRequests();
  }, [filter, viewType]);

  const handleToggleRequest = (id: string) => {
    setSelectedRequest(selectedRequest === id ? null : id);
  };

  const handleDeleteRequest = async (id: string) => {
    if (onDelete && confirm('Are you sure you want to delete this prayer request?')) {
      try {
        await onDelete(id);
        setPrayerRequests(prayerRequests.filter(request => request.id !== id));
      } catch (err) {
        console.error('Error deleting prayer request:', err);
        alert('Failed to delete prayer request. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error</h3>
          <p className="text-gray-700">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (prayerRequests.length === 0) {
    let message = '';
    
    if (viewType === 'community') {
      message = 'No community prayer requests are currently available. Check back later!';
    } else if (viewType === 'personal') {
      message = 'You haven\'t submitted any prayer requests yet.';
    } else if (viewType === 'admin') {
      message = filter === 'approved' 
        ? 'No prayer requests have been approved yet.'
        : filter === 'pending' 
          ? 'There are no pending prayer requests that need review.'
          : filter === 'rejected'
            ? 'There are no rejected prayer requests.'
            : 'There are no prayer requests in the system.';
    }
    
    return (
      <Card className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold text-blue-900 mb-2">No Prayer Requests</h3>
          <p className="text-gray-700">{message}</p>
          
          {viewType === 'personal' && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-3">Would you like to submit your first prayer request?</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {prayerRequests.map((request) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            layout
          >
            <Card className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-blue-900">{request.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {request.isAnonymous && request.userId !== session.user.id
                        ? 'Anonymous'
                        : request.user?.name || request.user?.email || 'Anonymous'}
                      {' • '}
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {(isAdmin || request.userId === session.user.id) && (
                    <div className="flex space-x-2">
                      {onDelete && (
                        <Button
                          onClick={() => handleDeleteRequest(request.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-600 text-xs rounded-full p-1"
                          size="sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                <div 
                  className={`mt-3 transition-all duration-300 ${
                    selectedRequest === request.id ? 'max-h-96' : 'max-h-24 overflow-hidden'
                  }`}
                >
                  <p className="text-gray-700 whitespace-pre-line">{request.content}</p>
                </div>
                
                {request.content.length > 150 && (
                  <Button
                    onClick={() => handleToggleRequest(request.id)}
                    variant="link"
                    className="mt-2 text-purple-600 hover:text-purple-800 p-0"
                  >
                    {selectedRequest === request.id ? 'Show less' : 'Read more'}
                  </Button>
                )}
                
                {/* Only show approval buttons in admin view */}
                {isAdmin && viewType === 'admin' && request.status === 'pending' && (
                  <div className="mt-4 flex space-x-2">
                    <Button
                      className="bg-green-100 hover:bg-green-200 text-green-700"
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/prayer-requests/${request.id}`, {
                            method: 'PATCH',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ status: 'approved' }),
                          });
                          
                          if (!response.ok) {
                            throw new Error('Failed to approve prayer request');
                          }
                          
                          // Update the local state
                          setPrayerRequests(prayerRequests.map(item => 
                            item.id === request.id ? { ...item, status: 'approved' } : item
                          ));
                        } catch (err) {
                          console.error('Error approving prayer request:', err);
                          alert('Failed to approve prayer request. Please try again.');
                        }
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      className="bg-red-100 hover:bg-red-200 text-red-700"
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/prayer-requests/${request.id}`, {
                            method: 'PATCH',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ status: 'rejected' }),
                          });
                          
                          if (!response.ok) {
                            throw new Error('Failed to reject prayer request');
                          }
                          
                          // Update the local state
                          setPrayerRequests(prayerRequests.map(item => 
                            item.id === request.id ? { ...item, status: 'rejected' } : item
                          ));
                        } catch (err) {
                          console.error('Error rejecting prayer request:', err);
                          alert('Failed to reject prayer request. Please try again.');
                        }
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                )}
                
                {/* Status badge for personal view */}
                {viewType === 'personal' && request.status !== 'approved' && (
                  <div className="mt-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      request.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {request.status === 'pending' ? 'Pending Review' : 'Not Approved'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}