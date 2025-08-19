"use client";
import { useUser } from "@/app/provider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/services/supabaseClient";
import { Video } from "lucide-react";
import React, { useEffect, useState } from "react";
import InterviewCard from "../dashboard/_components/interviewcard";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function ScheduledInterview() {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    user && GetInterviewList();
  }, [user]);

  // Auto-refresh every 30 seconds to catch new interview results
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      GetInterviewList();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);
  const GetInterviewList = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      }
      
      if (!user?.email) {
        console.log('No user email found');
        return;
      }
      
      console.log('Fetching scheduled interviews for user:', user.email);
      
      // First, get all interviews for the user
      const { data: interviews, error: interviewError } = await supabase
        .from("interviews")
        .select(`
          jobposition,
          duration,
          interview_id,
          created_at
        `)
        .eq("useremail", user.email)
        .order("created_at", { ascending: false });
      
      if (interviewError) {
        throw interviewError;
      }
      
      if (!interviews || interviews.length === 0) {
        setInterviewList([]);
        return;
      }
      
      // Get all interview results for these interviews
      const interviewIds = interviews.map(i => i.interview_id);
      const { data: results, error: resultsError } = await supabase
        .from("interview_results")
        .select(`
          email,
          conversation_transcript,
          completed_at,
          interview_id
        `)
        .in("interview_id", interviewIds);
      
      if (resultsError) {
        throw resultsError;
      }
      
      // Combine the data
      const interviewsWithResults = interviews.map(interview => ({
        ...interview,
        interview_results: results?.filter(r => r.interview_id === interview.interview_id) || []
      }));
      
      console.log('Fetched scheduled interviews:', interviewsWithResults);
      setInterviewList(interviewsWithResults);
      
    } catch (error) {
      const errorMessage = error.message || 'Unknown error occurred';
      console.error('Error in GetInterviewList:', {
        message: errorMessage,
        code: error.code,
        details: error.details,
        error: error
      });
      toast.error(`Failed to load interviews: ${errorMessage}`);
    } finally {
      if (showRefreshIndicator) {
        setIsRefreshing(false);
      }
    }
  };

  const handleManualRefresh = () => {
    GetInterviewList(true);
    toast.success("Refreshing interview data...");
  };

  return (
    <div className="mt-5" >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-2xl">Interview List with feedback</h2>
          <Button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Refreshing...
              </>
            ) : (
              "Refresh"
            )}
          </Button>
        </div>
        {interviewList?.length === 0 ? (
        <div className="p-5 flex flex-col items-center gap-3 text-center text-gray-500 bg-white border rounded-xl shadow-sm">
          <Video className="text-primary h-10 w-10" />
          <h2 className="text-base">You don't have any interview created</h2>
          <Button
            className="cursor-pointer"
            onClick={() => router.push("/recruiter/dashboard/create-interview")}
          >
            + Create New Interview
          </Button>
        </div>
      ) : (
        interviewList && (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
            {interviewList?.map((interview, index) => (
              <InterviewCard interview={interview} key={index} viewDetail={true}/>
            ))}
          </div>
        )
      )}
    </div>
  )
}

export default ScheduledInterview;
