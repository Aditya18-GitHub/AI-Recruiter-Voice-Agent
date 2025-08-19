'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/services/supabaseClient';
import { toast } from 'sonner';

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthRedirect = async () => {
      setLoading(true);
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        toast.error("Failed to complete sign in");
        console.error("Session error:", error);
        setLoading(false);
        return;
      }

      const user = session.user;
      const email = user.email;

      // 1. Check if user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id, role, banned')
        .eq('email', email)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // Not found is ok
        toast.error("Error fetching user profile: " + fetchError.message);
        console.error("Fetch error:", fetchError);
        setLoading(false);
        return;
      }

      // Check if user is banned
      if (existingUser && existingUser.banned) {
        await supabase.auth.signOut();
        toast.error('Your account has been banned. Please contact support for more information.');
        router.push('/login');
        setLoading(false);
        return;
      }

      let finalRole = 'candidate'; 
      let justCreated = false;

      if (!existingUser) {
        const savedRole = localStorage.getItem("pending_role") || 'candidate';
        finalRole = savedRole;
      
        const { error: insertError } = await supabase.from('users').insert([
          {
            email: user.email,
            name: user.user_metadata?.full_name || "No Name",
            role: savedRole,
          },
        ]);

        if (insertError) {
          // If duplicate key error, just continue as if user exists
          if (
            insertError.code === '23505' || // Postgres unique violation
            (insertError.message && insertError.message.includes('duplicate key'))
          ) {
            // User already exists, fetch their role
            const { data: userRow, error: fetchAgainError } = await supabase
              .from('users')
              .select('role')
              .eq('email', user.email)
              .single();
            if (userRow) {
              finalRole = userRow.role;
            }
            // Continue to dashboard
          } else {
            toast.error("Failed to create user profile: " + insertError.message);
            console.error("Insert error:", insertError);
            setLoading(false);
            return;
          }
        } else {
          toast.success("Profile created successfully.");
        }
      } else if (existingUser) {
        finalRole = existingUser.role;
      }

      localStorage.removeItem("pending_role");

      setLoading(false);
      if (finalRole === 'recruiter') {
        router.push('/recruiter/dashboard');
      } else {
        router.push('/candidate/dashboard');
      }
    };

    handleAuthRedirect();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finalizing Google login, please wait...</p>
        </div>
      </div>
    );
  }
  return null;
}
