'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { userProfile } = UserAuth();
  const router = useRouter();

  useEffect(() => {
    if (userProfile) {
      if (userProfile.role === 'recruiter') {
        router.replace('/recruiter/dashboard');
      } else if (userProfile.role === 'candidate') {
        router.replace('/candidate/dashboard');
      }
    }
  }, [userProfile, router]);

  return null; // Or a loading spinner
}
