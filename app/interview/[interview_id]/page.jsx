'use client';
import { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { supabase } from '@/services/supabaseClient';
import { toast } from 'sonner';
import { InterviewDataContext } from '@/context/InterviewDataContext';
import { useUser } from '@/app/provider';

// Dynamic imports for client-side only components

// Icons are only loaded on the client
// Icons are only loaded on the client
const Clock = dynamic(() => import('lucide-react').then(mod => mod.Clock), { ssr: false });
const Mic = dynamic(() => import('lucide-react').then(mod => mod.Mic), { ssr: false });
const Video = dynamic(() => import('lucide-react').then(mod => mod.Video), { ssr: false });
const CheckCircle = dynamic(() => import('lucide-react').then(mod => mod.CheckCircle), { ssr: false });

export default function InterviewPage({ initialData }) {
  const params = useParams();
  const interview_id = params?.interview_id;
  const router = useRouter();
  const { user } = useUser();
  
  // State management
  const [interviewData, setInterviewData] = useState(initialData);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(!initialData);
  const [accessDenied, setAccessDenied] = useState(false);
  const { interviewInfo, setInterviewInfo } = useContext(InterviewDataContext);
  
  // Memoize derived state
  const isFormValid = useMemo(() => {
    return userName.trim().split(' ').length >= 2;
  }, [userName]);

  const isGoogleUser = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      const provider = JSON.parse(localStorage.getItem('supabase.auth.token'))
        ?.currentSession?.user?.app_metadata?.provider;
      return provider === 'google';
    } catch {
      return false;
    }
  }, []);

  // Fetch interview details if not provided through server props
  useEffect(() => {
    if (!interview_id) return;
    
    const fetchInterviewDetails = async () => {
      if (interviewData) return; // Skip if we already have data
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('interviews')
          .select('useremail, jobposition, jobdescription, duration, type, questionlist')
          .eq('interview_id', interview_id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('No interview found');
        
        setInterviewData(data);
      } catch (error) {
        console.error('Failed to fetch interview details:', error);
        toast.error(error.message || 'Failed to fetch interview details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviewDetails();
  }, [interview_id, interviewData]);

  // Check user access
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push('/login');
          return;
        }
        setAccessDenied(false);
      } catch (error) {
        console.error('Access check failed:', error);
        setAccessDenied(true);
      }
    };

    checkAccess();
  }, [router]);

  // Set user data on mount
  useEffect(() => {
    if (!user) return;
    
    if (user.email && !userEmail) {
      setUserEmail(user.email);
    }
    if (user.name && !userName) {
      setUserName(user.name);
    }
  }, [user, userEmail, userName]);


  const validateJoin = useCallback(() => {
    if (!userName.trim()) {
      toast.warning('Full name is required');
      return false;
    }
    
    if (userName.trim().split(' ').length < 2) {
      toast.warning('Please provide your full name (e.g., First Last)');
      return false;
    }
    
    return true;
  }, [userName]);
  
  const onJoinInterview = useCallback(async () => {
    if (!validateJoin()) return;
    
    try {
      let candidatePicture = null;
      
      // Safely get user picture from auth session
      if (typeof window !== 'undefined') {
        try {
          const session = JSON.parse(
            localStorage.getItem('supabase.auth.token')
          )?.currentSession;
          
          candidatePicture = session?.user?.user_metadata?.picture || user?.picture || null;
        } catch (e) {
          console.error('Error getting user picture:', e);
        }
      }

      const newInterviewInfo = {
        ...interviewInfo,
        candidate_name: userName,
        candidate_picture: candidatePicture,
        jobposition: interviewData?.jobposition,
        jobdescription: interviewData?.jobdescription,
        duration: interviewData?.duration,
        useremail: userEmail,
        type: interviewData?.type,
        questionlist: interviewData?.questionlist,
        interview_id: interview_id,
      };
      
      // Update context and local storage
      setInterviewInfo(newInterviewInfo);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('interviewInfo', JSON.stringify(newInterviewInfo));
      }
      
      toast.success('Creating your interview session...');
      
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Use replace instead of push to prevent going back to this page
      router.replace(`/interview/${interview_id}/start`);
    } catch (error) {
      console.error('Failed to join interview:', error);
      toast.error('Failed to start interview. Please try again.');
    }
  }, [validateJoin, interviewInfo, interviewData, userName, userEmail, interview_id, setInterviewInfo, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 mx-auto rounded-full bg-gray-200 mb-4"></div>
          <p className="text-gray-600">Loading interview details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (accessDenied || !interviewData) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            {accessDenied ? 'Access Denied' : 'Interview Not Found'}
          </h2>
          <p className="text-gray-600 mb-6">
            {accessDenied 
              ? 'You do not have permission to access this interview.'
              : 'The requested interview could not be found or is no longer available.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  
    // Success state - render the interview form with all required data

// Success state - render the interview form with all required data
return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 py-12 px-4 sm:px-6 lg:px-8">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      {/* Animated Header */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="flex flex-col items-center mb-12"
      >
        <div className="relative w-28 h-28 mb-4">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-dashed border-indigo-200 rounded-full"
          />
          <Image
            src="/logo.png" 
            alt="Logo" 
            fill
            className="object-contain p-4"
            priority
          />
        </div>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          AI Interview Portal
        </h1>
        <p className="mt-2 text-gray-500">Next-generation hiring experience</p>
      </motion.div>

      {/* Glassmorphism Card */}
      <motion.div 
        whileHover={{ y: -5 }}
        className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/20"
      >
        {/* Interview Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {interviewData?.jobposition || 'AI Interview'}
              </h2>
              <div className="flex items-center gap-2 mt-2 text-indigo-100">
                <Clock className="h-4 w-4" />
                <span>{interviewData?.duration || '30 min'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-white">Live Session Ready</span>
            </div>
          </div>
        </div>

        {/* Interview Content */}
        <div className="p-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
                required
              />
              {userName && userName.trim().split(' ').length < 2 && (
                <p className="mt-1 text-sm text-yellow-600">
                  Please provide both first and last name
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">
                Your email is managed through your account settings
              </p>
            </div>

            {interviewData?.jobdescription && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="font-medium text-gray-900 mb-2">Job Description</h3>
                <p className="text-gray-600 whitespace-pre-line">
                  {interviewData.jobdescription}
                </p>
              </div>
            )}

            <div className="pt-4">
              <button
                onClick={onJoinInterview}
                disabled={!isFormValid || isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  !isFormValid || isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Preparing...
                  </>
                ) : (
                  'Join Interview Now'
                )}
              </button>
              
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500 mr-2" />
                <span>Your video and audio will be recorded during the interview</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer Note */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-sm text-gray-500 mt-12"
      >
        Powered by AI interview technology • Secure and confidential
      </motion.p>
    </motion.div>
  </div>
);
}