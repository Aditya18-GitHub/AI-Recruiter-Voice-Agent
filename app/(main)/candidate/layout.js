'use client';
import React from 'react';
import DashboardProvider from './provider';
import WelcomeContainer from './dashboard/_components/WelcomeContainer';
import { SpeedInsights } from '@vercel/speed-insights/next';

function DashboardLayout({ children }) {
  return (
    <DashboardProvider>
      <div className="p-10 w-full space-y-6">
        <WelcomeContainer />
        {children}
      </div>
      <SpeedInsights />
    </DashboardProvider>
  );
}

export default DashboardLayout;
