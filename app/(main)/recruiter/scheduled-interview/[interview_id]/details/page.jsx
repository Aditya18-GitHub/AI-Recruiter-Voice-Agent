"use client";
import { supabase } from "@/services/supabaseClient";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useUser } from "@/app/provider";
import InterviewDetailContainer from "./_components/InteviewDetailContainer";
import CandidateList from "./_components/CandidateList";

function InterviewDetail() {
  const { interview_id } = useParams();
  const { user } = useUser();
  const [interviewDetail, setInterviewDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      GetInterviewDetail();
    }
  }, [user]);

  // Auto-refresh every 30 seconds to catch new interview results
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      GetInterviewDetail();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const GetInterviewDetail = async () => {
    try {
      setLoading(true);
      
      // First, get the interview details
      const { data: interviewData, error: interviewError } = await supabase
        .from("interviews")
        .select('*')
        .eq("useremail", user.email)
        .eq("interview_id", interview_id)
        .single();

      if (interviewError) throw interviewError;
      
      if (!interviewData) {
        setError('Interview not found');
        return;
      }
      
      // Then get the interview results for this interview
      const { data: results, error: resultsError } = await supabase
        .from("interview_results")
        .select('*')
        .eq("interview_id", interview_id);
        
      if (resultsError) throw resultsError;
      
      // Combine the data
      const interviewWithResults = {
        ...interviewData,
        interview_results: results || []
      };
      
      console.log('Fetched interview details:', interviewWithResults);
      setInterviewDetail(interviewWithResults);
      
    } catch (err) {
      console.error("Error fetching interview details:", err);
      setError(err.message || 'Failed to load interview details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="mt-5">Loading interview details...</div>;
  }

  if (error) {
    return <div className="mt-5 text-red-500">Error: {error}</div>;
  }

  if (!interviewDetail) {
    return <div className="mt-5">No interview found</div>;
  }

  return (
    <div className="mt-5 space-y-6">
      <h2 className="font-bold text-2xl">Interview Details</h2>
      <InterviewDetailContainer interviewDetail={interviewDetail} />
      <CandidateList 
        candidateList={interviewDetail["interview_results"] || []} 
      />
    </div>
  );
}

export default InterviewDetail;