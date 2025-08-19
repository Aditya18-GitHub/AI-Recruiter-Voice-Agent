"use client"
import { Phone } from 'lucide-react'
import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/services/supabaseClient'

function CreateOptions() {

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    if (!code.trim()) {
      toast.error('Please enter an interview link or code.');
      return;
    }

    setLoading(true);

    try {
      // Extract UUID from URL if it's a full URL
      let interviewId = code.trim();
      const urlMatch = code.match(/interview\/([a-f0-9-]+)/i);
      if (urlMatch && urlMatch[1]) {
        interviewId = urlMatch[1];
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(interviewId)) {
        toast.error('Invalid interview code format. Please check and try again.');
        return;
      }

      // Check if interview exists
      const { data, error } = await supabase
        .from('interviews')
        .select('interview_id')
        .eq('interview_id', interviewId)
        .single();

      if (error || !data) {
        toast.error('Interview not found. Please check the code and try again.');
        return;
      }

      // Open the interview in a new tab
      const interviewUrl = `${window.location.origin}/interview/${interviewId}`;
      window.open(interviewUrl, '_blank', 'noopener,noreferrer');
      
      toast.success('Opening interview in a new tab...');
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('Failed to open interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-md mx-auto'>
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col h-full">
        <Phone className="p-2 text-blue-600 bg-blue-50 rounded-lg h-12 w-12" />
        <h2 className="mt-3 mb-2 font-semibold">Interview Code</h2>

        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste interview link or code"
          className="mb-2"
          onPaste={(e) => {
            const pastedText = e.clipboardData.getData('text');
            // If it's a full URL, extract just the UUID part
            const urlMatch = pastedText.match(/interview\/([a-f0-9-]+)/i);
            if (urlMatch && urlMatch[1]) {
              e.preventDefault();
              setCode(urlMatch[1]);
            }
          }}
        />

        <p className="text-gray-500 text-sm mb-4">
          Paste the full interview link or just the code
        </p>

        <div className="mt-auto">
          <Button onClick={handleStart} disabled={loading} className="w-full cursor-pointer">
            {loading ? 'Checking...' : 'Start'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CreateOptions