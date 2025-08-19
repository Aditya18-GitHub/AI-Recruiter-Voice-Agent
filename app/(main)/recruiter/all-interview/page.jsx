"use client";
import { useUser } from "@/app/provider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/services/supabaseClient";
import { Video } from "lucide-react";
import react, { useEffect, useState } from "react";
import InterviewCard from "../dashboard/_components/interviewcard";
import { useRouter } from "next/navigation";

function AllInterview() {
  const router = useRouter();

  const [InterviewList, setInterviewList] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    user && GetInterviewList();
  }, [user]);

  const GetInterviewList = async () => {
    try {
      if (!user?.email) {
        console.log('No user email found');
        return;
      }
      
      console.log('Fetching all interviews for user:', user.email);
      
      // First, get all interviews for the user
      const { data: interviews, error: interviewError } = await supabase
        .from("interviews")
        .select('*')
        .eq("useremail", user.email)
        .order('created_at', { ascending: false });
      
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
      
      console.log('Fetched all interviews:', interviewsWithResults);
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
    }
  };

  return (
    <div className="my-5">
      <h2 className="font-bold text-2xl mb-4">Previously Created Interviews</h2>

      {InterviewList?.length === 0 ? (
        <div className="p-5 flex flex-col items-center gap-3 text-center text-gray-500 bg-white border rounded-xl shadow-sm">
          <Video className="text-primary h-10 w-10" />
          <h2 className="text-base">You don't have any interview created</h2>
          <Button
            className="cursor-pointer"
            onClick={() => router.push("/dashboard/create-interview")}
          >
            + Create New Interview
          </Button>
        </div>
      ) : (
        InterviewList && (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
            {InterviewList.map((interview, index) => (
              <InterviewCard interview={interview} key={index} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
export default AllInterview;
