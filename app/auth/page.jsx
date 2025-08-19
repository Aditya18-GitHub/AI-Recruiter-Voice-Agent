'use client'
import React from 'react'
import { supabase } from '@/services/supabaseClient'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { MoveRight, Sparkles, ShieldCheck, Clock, BarChart2, Zap } from 'lucide-react'

export default function Login() {
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' 
            ? `${window.location.origin}/auth/callback` 
            : undefined
        }
    })
    if (error) console.error(error.message)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col">
      {/* Main Content */}
      <div className="flex flex-1 justify-center">
        <div className="w-full max-w-4xl flex flex-col justify-center px-8 py-12 md:px-12 lg:px-16 xl:px-24 space-y-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
              AI Recruiter Pro
            </h1>
          </div>

          <h2 className="text-3xl font-semibold text-gray-900 leading-tight">
            Transform Your <span className="text-blue-600">Hiring Process</span> with AI
          </h2>

          <p className="text-gray-600 max-w-lg text-lg leading-relaxed">
            Our intelligent platform leverages cutting-edge artificial intelligence to help you find, evaluate, and hire top talent faster than ever before.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-start space-x-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <ShieldCheck className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Bias-Free Screening</h3>
                <p className="text-gray-500 text-sm">Reduce unconscious bias in hiring</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Clock className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Time Savings</h3>
                <p className="text-gray-500 text-sm">80% faster candidate screening</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <BarChart2 className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Data Insights</h3>
                <p className="text-gray-500 text-sm">Actionable hiring analytics</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Zap className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Smart Matching</h3>
                <p className="text-gray-500 text-sm">AI-powered candidate-job fit</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center space-x-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-10 w-10 rounded-full bg-blue-100 border-2 border-white" />
              ))}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Trusted by 500+ companies</p>
              <p className="text-xs text-gray-500">Including Fortune 500 leaders</p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-10 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to AI Recruiter
            </h2>
            <p className="text-gray-600 mb-8">
              Sign in with your Google account to continue
            </p>

            <Button
              onClick={signInWithGoogle}
              className="w-full py-3 px-4 inline-flex justify-center items-center gap-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer "
            >
              <Image 
                src="/googleicon.png" 
                alt="Google" 
                width={20} 
                height={20} 
                className="w-5 h-5"
              />
              Continue with Google
              <MoveRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our{' '}
              <a href="#" className="font-medium text-gray-700 hover:text-blue-600">Terms</a> and{' '}
              <a href="#" className="font-medium text-gray-700 hover:text-blue-600">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}