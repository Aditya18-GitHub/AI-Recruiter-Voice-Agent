"use client"
import { UserDetailContext } from '@/context/UserDetailContext';
import { supabase } from '@/services/supabaseClient';
import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

function Provider({ children }) {
    const [user, setUser] = useState();
    const router = useRouter();

    // Fetch user from Supabase and DB
    const fetchAndSetUser = async () => {
        const { data: { user: supaUser } } = await supabase.auth.getUser();
        if (!supaUser) {
            setUser(null);
            return;
        }
        let { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', supaUser.email);
        if (users?.length === 0) {
            // Do NOT create user here for OAuth signups!
            // Let /auth/callback handle user creation and role assignment
            setUser(null);
            return;
        }
        
        // Check if user is banned
        if (users[0]?.banned) {
            await supabase.auth.signOut();
            toast.error('Your account has been banned. Please contact support for more information.');
            router.push('/login');
            setUser(null);
            return;
        }
        
        setUser(users[0]);
    };

    // Function to update user credits
    const updateUserCredits = async (newCredits) => {
        if (!user?.email) return;
        
        try {
            const { data, error } = await supabase
                .from('users')
                .update({ credits: newCredits })
                .eq('email', user.email)
                .select();
            
            if (!error && data?.[0]) {
                setUser(data[0]);
                return { success: true, data: data[0] };
            }
            return { success: false, error };
        } catch (error) {
            console.error('Error updating credits:', error);
            return { success: false, error };
        }
    };

    useEffect(() => {
        fetchAndSetUser(); // Initial fetch
        // Listen for auth state changes
        const { data: listener } = supabase.auth.onAuthStateChange((_event, _session) => {
            fetchAndSetUser();
        });
        return () => {
            listener?.subscription?.unsubscribe();
        };
    }, []);

    return (
        <UserDetailContext.Provider value={{ user, setUser, updateUserCredits }}>
            <div>{children}</div>
        </UserDetailContext.Provider>
    );
}

export default Provider;

export const useUser = () => {
    const context = useContext(UserDetailContext);
    return context;
}
