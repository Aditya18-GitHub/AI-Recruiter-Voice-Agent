'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@/app/provider';
import { useRouter, usePathname } from 'next/navigation';
import { Shield } from 'lucide-react';
import { supabase } from '@/services/supabaseClient';
import { toast } from 'sonner';

function AdminLayout({ children }) {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log('Admin Layout - Current user:', user);
    console.log('Admin Layout - User email:', user?.email);
    console.log('Admin Layout - Current path:', pathname);
    
    // If we're on the login page, don't check authentication
    if (pathname === '/admin/login') {
      setIsChecking(false);
      return;
    }
    
    // If user is still loading (undefined), wait
    if (user === undefined) {
      setIsChecking(true);
      return;
    }
    
    // If user is not logged in, redirect to login
    if (!user) {
      console.log('Admin Layout - No user found, redirecting to admin login');
      router.push('/admin/login');
      return;
    }
    
    // Check if user is banned
    if (user.banned) {
      console.log('Admin Layout - User is banned, signing out');
      supabase.auth.signOut();
      toast.error('Your account has been banned. Please contact support for more information.');
      router.push('/admin/login');
      return;
    }
    
    // Check if user email contains @admin
    console.log('Admin Layout - Checking if', user.email, 'contains @admin');
    
    if (!user.email.includes('@admin') && !user.email.includes('@superadmin')) {
      console.log('Admin Layout - User not admin or superadmin, redirecting to dashboard');
      router.push('/users');
      return;
    }
    
    console.log('Admin Layout - User is admin, allowing access');
    setIsChecking(false);
  }, [user, router, pathname]);

  // If we're on the login page, render without admin layout
  if (pathname === '/admin/login') {
    return children;
  }

  if (user === undefined || isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-100">
        <div className="flex flex-col items-center gap-6 p-10 rounded-2xl shadow-lg bg-white/80 border border-blue-100">
          <Shield className="w-16 h-16 text-blue-500 animate-bounce" />
          <h2 className="text-2xl font-bold text-blue-700">Loading Admin Panel...</h2>
          <p className="text-gray-500">Please wait while we verify your access.</p>
          <div className="w-32 h-2 bg-blue-100 rounded-full overflow-hidden">
            <div className="h-2 bg-blue-500 animate-pulse rounded-full w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name || 'Admin'}
              </span>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/');
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-3">
            <a
              href="/admin"
              className={`text-sm font-medium px-3 py-2 rounded-md ${
                pathname === '/admin' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </a>
            <a
              href="/admin/users"
              className={`text-sm font-medium px-3 py-2 rounded-md ${
                pathname === '/admin/users' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Users
            </a>
            <a
              href="/admin/interviews"
              className={`text-sm font-medium px-3 py-2 rounded-md ${
                pathname === '/admin/interviews' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Interviews
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout; 