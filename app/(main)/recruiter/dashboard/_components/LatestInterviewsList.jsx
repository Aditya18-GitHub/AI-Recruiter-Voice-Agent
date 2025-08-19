"use client";
import { Video } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseClient";
import { useUser } from "@/app/provider";
import InterviewCard from "./interviewcard";
import { toast } from "sonner";

function LatestInterviewsList() {
  const router = useRouter();

  const [InterviewList, setInterviewList] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useUser();

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
      
      console.log('Fetching interviews for user:', user.email);
      
      // First, get all interviews for the user
      const { data: interviews, error: interviewError } = await supabase
        .from("interviews")
        .select('*')
        .eq("useremail", user.email)
        .order('created_at', { ascending: false })
        .limit(6);
      
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
        .select('*')
        .in("interview_id", interviewIds);
      
      if (resultsError) {
        throw resultsError;
      }
      
      // Combine the data
      const interviewsWithResults = interviews.map(interview => ({
        ...interview,
        interview_results: results?.filter(r => r.interview_id === interview.interview_id) || []
      }));
      
      console.log('Fetched interviews:', interviewsWithResults);
      setInterviewList(interviewsWithResults);
      
    } catch (error) {
      const errorMessage = error?.message || 'An unknown error occurred while fetching interviews.';
      console.error('Error in GetInterviewList:', error);
      toast.error(errorMessage);
    } finally {
      if (showRefreshIndicator) {
        setIsRefreshing(false);
      }
    }
  };

  const handleInterviewDelete = () => {
    // Refresh the interview list after deletion
    GetInterviewList();
  };

  const handleManualRefresh = () => {
    GetInterviewList(true);
    toast.success("Refreshing interview data...");
  };

  return (
    <div className="my-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-2xl">Previously Created Interviews</h2>
        <Button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          variant="outline"
          className="border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          {isRefreshing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Refreshing...
            </>
          ) : (
            "Refresh"
          )}
        </Button>
      </div>

      {InterviewList?.length === 0 ? (
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
        InterviewList &&
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
          {InterviewList.map((interview, index) => (
            <InterviewCard 
              interview={interview} 
              key={index} 
              onDelete={handleInterviewDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default LatestInterviewsList;