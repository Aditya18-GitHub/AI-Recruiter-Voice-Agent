"use client";
import { useUser } from '@/app/provider';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/services/supabaseClient';

function WelcomeContainer() {
    const { user } = useUser();
    const [userData, setUserData] = useState({
        name: user?.name || 'User',
        picture: null
    });

    useEffect(() => {
        if (user?.email) {
            fetchLatestUserData();
        }
    }, [user]);

    const fetchLatestUserData = async () => {
        try {
            // Get latest user data from database
            const { data: userRecord, error } = await supabase
                .from('users')
                .select('name, picture')
                .eq('email', user.email)
                .single();

            if (!error && userRecord) {
                setUserData({
                    name: userRecord.name || user?.name || user?.email?.split('@')[0] || 'User',
                    picture: userRecord.picture || user?.picture
                });
            } else {
                // Fallback to provider user data
                setUserData({
                    name: user?.name || user?.email?.split('@')[0] || 'User',
                    picture: user?.picture
                });
            }

            // Check for Google profile in localStorage
            if (typeof window !== 'undefined') {
                const googleProfile = localStorage.getItem('googleProfile');
                if (googleProfile) {
                    const { name, picture } = JSON.parse(googleProfile);
                    setUserData(prev => ({
                        ...prev,
                        name: name || prev.name,
                        picture: picture || prev.picture
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            // Fallback to provider user data
            setUserData({
                name: user?.name || user?.email?.split('@')[0] || 'User',
                picture: user?.picture
            });
        }
    };

    return (
        <div className="bg-white p-5 rounded-xl border shadow-md flex justify-between items-center">
            <div>
                <h2 className="text-lg font-bold">
                    Welcome Back, <span className="text-blue-600">{userData.name}</span>
                </h2>
                <h2 className="text-gray-500">Your Path to Great Jobs Starts with AI Interviews</h2>
            </div>
            
            {userData.picture ? (
                <div className="w-[50px] h-[50px] rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image 
                        src={userData.picture} 
                        alt='userAvatar' 
                        width={50} 
                        height={50} 
                        className='w-full h-full object-cover' 
                    />
                </div>
            ) : (
                <div className="w-[50px] h-[50px] rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-lg font-semibold text-blue-600">
                        {userData.name.charAt(0).toUpperCase()}
                    </span>
                </div>
            )}
        </div>
    );
}

export default WelcomeContainer;