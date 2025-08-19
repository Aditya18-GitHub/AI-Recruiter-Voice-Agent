'use client';
import { Check, Clock, Mail, Shield, ChevronRight } from 'lucide-react';
import React, { useEffect } from 'react';

const InterviewCompleted = () => {
  // Prevent going back to interview page
  useEffect(() => {
    const handlePopstate = (event) => {
      // Replace the current state to prevent going back
      window.history.pushState(null, '', window.location.href);
    };

    // Add event listener for browser back button
    window.addEventListener('popstate', handlePopstate);

    // Push current state to prevent back navigation
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white p-8 rounded-3xl shadow-xl text-center border border-gray-100 overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-100 rounded-full opacity-20"></div>
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-purple-100 rounded-full opacity-20"></div>
        
        {/* Success confirmation */}
        <div className="relative z-10 mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-green-100 to-green-50 mb-8 animate-soft-bounce">
          <div className="absolute inset-0 rounded-full border-4 border-green-100 opacity-60 animate-ping-slow"></div>
          <Check className="h-12 w-12 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3 relative z-10">
          Interview Submitted <span className="text-blue-600">Successfully</span>
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 relative z-10">
          Thank you for completing your interview with{' '}
          <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
            Recruiter AI
          </span>. 
          We appreciate your thoughtful responses.
        </p>

        {/* Process timeline */}
        <div className="relative z-10 space-y-6 mb-8">
          <div className="flex items-start bg-gradient-to-r from-blue-50 to-white p-4 rounded-xl border border-blue-100">
            <div className="flex-shrink-0 bg-white p-2 rounded-lg mr-4 shadow-sm border border-blue-100">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900 flex items-center">
                Secure Processing <ChevronRight className="ml-1 h-4 w-4 text-blue-400" />
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Your responses are encrypted and stored with enterprise-grade security.
              </p>
            </div>
          </div>

          <div className="flex items-start bg-gradient-to-r from-purple-50 to-white p-4 rounded-xl border border-purple-100">
            <div className="flex-shrink-0 bg-white p-2 rounded-lg mr-4 shadow-sm border border-purple-100">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900 flex items-center">
                Review Timeline <ChevronRight className="ml-1 h-4 w-4 text-purple-400" />
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Our team will review your responses within{' '}
                <span className="font-medium bg-purple-50 px-1.5 py-0.5 rounded text-purple-700">
                  3 business days
                </span>.
              </p>
            </div>
          </div>

          <div className="flex items-start bg-gradient-to-r from-green-50 to-white p-4 rounded-xl border border-green-100">
            <div className="flex-shrink-0 bg-white p-2 rounded-lg mr-4 shadow-sm border border-green-100">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900 flex items-center">
                Next Steps <ChevronRight className="ml-1 h-4 w-4 text-green-400" />
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Expect an email update - check your spam folder if you don't see it.
              </p>
            </div>
          </div>
        </div>

        {/* Final instructions */}
        <div className="relative z-10 bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200 shadow-inner">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="h-1.5 w-1.5 bg-purple-400 rounded-full animate-pulse delay-100"></div>
            <div className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse delay-200"></div>
          </div>
          <p className="text-gray-700 font-medium">
            You've completed all steps! This window can now be closed.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Any further Questions ? Contact{' '}
            <span className="text-blue-600 font-medium">support@email.com</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterviewCompleted;