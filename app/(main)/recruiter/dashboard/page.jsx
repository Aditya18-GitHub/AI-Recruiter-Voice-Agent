'use client';
import React from 'react';
import CreateOptions from './_components/CreateOptions';
import LatestInterviewsList from './_components/LatestInterviewsList';
import CreditsDisplay from './_components/CreditsDisplay';

function Dashboard() {
  return (
    <div>
      <h2 className='my-3 font-bold text-2xl'>Dashboard</h2>
      <CreditsDisplay />
      <CreateOptions />
      <LatestInterviewsList />
    </div>
  );
}

export default Dashboard;
