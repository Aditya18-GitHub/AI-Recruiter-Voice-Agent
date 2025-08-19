import { Phone, Video, Coins, AlertCircle } from 'lucide-react'
import React from 'react'
import Link from 'next/link'
import { useUser } from '@/app/provider'
import { Button } from '@/components/ui/button'

function CreateOptions() {
  const { user } = useUser();
  const hasCredits = (user?.credits || 0) > 0;

  return (
    <div className='grid grid-cols-1 md:max-w-lg gap-5'>
      <div className={`relative ${!hasCredits ? 'opacity-60' : ''}`}>
        <Link href={hasCredits ? '/recruiter/dashboard/create-interview' : '#'}>
          <div className={`bg-white border border-gray-200 rounded-lg p-5 shadow-sm ${hasCredits ? 'cursor-pointer hover:shadow-md transition-shadow' : 'cursor-not-allowed'}`}>
            <div className="flex items-center justify-between mb-3">
              <Video className='p-2 text-blue-600 bg-blue-50 rounded-lg h-12 w-12' />
              {!hasCredits && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">No Credits</span>
                </div>
              )}
            </div>
            <h2 className="font-semibold">Create New Interview</h2>
            <p className='text-gray-500 text-sm mb-3'>
              Create AI interviews and schedule them with candidates
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Coins className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600 font-medium">
                Cost: 1 Credit
              </span>
            </div>
          </div>
        </Link>
        {!hasCredits && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button 
              onClick={() => window.location.href = '/recruiter/billing'}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Buy Credits
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateOptions