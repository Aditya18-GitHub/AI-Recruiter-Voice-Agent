"use client";
import React, { useState } from 'react';
import InterviewHeader from './_components/InterviewHeader';
import { InterviewDataContext } from '@/context/InterviewDataContext';

const InterviewLayout = ({ children }) => {
  const [interviewInfo, setInterviewInfo] = useState();

  return (
    <InterviewDataContext.Provider value={{interviewInfo, setInterviewInfo}}>
      <InterviewHeader />
      <div className='bg-secondary pb-6'>
        {children}
      </div>
    </InterviewDataContext.Provider>
  );
};

export default InterviewLayout;