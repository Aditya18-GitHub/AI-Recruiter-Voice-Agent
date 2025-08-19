'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Coins } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import FormContainer from './_components/FormContainer';
import QuestionList from './_components/QuestionList';
import { toast } from 'sonner';
import InterviewLink from './_components/InterviewLink';
import { useUser } from '@/app/provider';

function CreateInterview() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [interviewId, setInterviewId] = useState();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  // Check credits when component mounts and when user changes
  useEffect(() => {
    if (user && user.credits <= 0) {
      toast.error("You don't have enough credits to create an interview");
      router.push('/recruiter/billing');
    }
  }, [user, router]);

  const onHandleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev, 
      [field]: value
    }));
  };

  const onGoToNext = () => {
    // First check credits
    if (user?.credits <= 0) {
      toast.error("Please purchase credits to create an interview");
      router.push('/recruiter/billing');
      return;
    }

    // Then validate form fields
    let missingField = '';
    if (!formData.jobposition) missingField = 'Job Position';
    else if (!formData.jobdescription) missingField = 'Job Description';
    else if (!formData.duration) missingField = 'Duration';
    else if (!formData.type) missingField = 'Interview Type';

    if (missingField) {
      toast.error(`${missingField} is required`);
      return;
    }
    
    setStep(step + 1);
  };

  const onCreateLink = async (interview_id) => {
    setLoading(true);
    
    // Double-check credits before proceeding
    if (user?.credits <= 0) {
      toast.error("Please purchase credits to create an interview");
      router.push('/recruiter/billing');
      setLoading(false);
      return;
    }

    try {
      setInterviewId(interview_id);
      setStep(step + 1);
    } catch (error) {
      toast.error("Failed to create interview link");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 px-10 md:px-24 lg:px-44 xl:px-56">
      <div className="flex gap-5 items-center">
        <ArrowLeft onClick={() => router.back()} className="cursor-pointer" />
        <h2 className="font-bold text-2xl">Create New Interview</h2>
      </div>
      
      {/* Credits Display */}
      {user && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Credits Available:</span>
              <span className="text-lg font-bold text-blue-600">{user.credits || 0}</span>
            </div>
            <div className="text-sm text-blue-600">
              Cost: 1 Credit per interview
            </div>
          </div>
          {user.credits <= 2 && (
            <div className="mt-2 text-xs text-amber-600">
              {user.credits === 0 
                ? "No credits remaining. Purchase more to continue."
                : user.credits === 1 
                ? "Only 1 credit remaining. Consider purchasing more."
                : "Low credits remaining. Consider purchasing more."
              }
            </div>
          )}
        </div>
      )}
      
      <Progress value={step * 33.33} className="my-5 h-2 w-full" />
      
      {step === 1 && (
        <FormContainer
          formData={formData}
          onHandleInputChange={onHandleInputChange}
          GoToNext={onGoToNext}
          loading={loading}
        />
      )}
      
      {step === 2 && (
        <QuestionList
          formData={formData}
          onCreateLink={onCreateLink}
        />
      )}
      
      {step === 3 && (
        <InterviewLink 
          interview_id={interviewId}
          formData={formData} 
        />
      )}
    </div>
  );
}

export default CreateInterview;