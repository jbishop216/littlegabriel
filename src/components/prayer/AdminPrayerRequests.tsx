'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Session } from 'next-auth';
import PrayerRequestList from './PrayerRequestList';

interface AdminPrayerRequestsProps {
  session: Session;
}

type RequestStatus = 'pending' | 'approved' | 'rejected' | 'all';

export default function AdminPrayerRequests({ session }: AdminPrayerRequestsProps) {
  const [activeTab, setActiveTab] = useState<RequestStatus>('pending');
  
  const handleApproveRequest = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/prayer-requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve prayer request');
      }
      
      // Refresh the list after approving
      // This will be handled internally by PrayerRequestList's useEffect
    } catch (error) {
      console.error('Error approving prayer request:', error);
    }
  };
  
  const handleRejectRequest = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/prayer-requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject prayer request');
      }
      
      // Refresh the list after rejecting
    } catch (error) {
      console.error('Error rejecting prayer request:', error);
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
  
  const isAdmin = session?.user?.role === 'admin';
  
  if (!isAdmin) {
    return (
      <Card className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h3>
          <p className="text-gray-700">You don't have permission to access this page.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Manage Prayer Requests</h2>
          
          <div className="flex space-x-2 border-b border-gray-200 mb-6">
            {(['pending', 'approved', 'rejected', 'all'] as RequestStatus[]).map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-purple-600'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'pending' && (
                  <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    New
                  </span>
                )}
              </button>
            ))}
          </div>
          
          <PrayerRequestList 
            session={session}
            filter={activeTab !== 'all' ? activeTab : undefined}
            onDelete={handleDeleteRequest}
          />
        </CardContent>
      </Card>
    </div>
  );
}