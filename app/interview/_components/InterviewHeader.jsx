import React from 'react';
import Image from 'next/image';

function InterviewHeader() {
  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center">
        <div className="flex-shrink-0">
          <Image 
            src="/logo.png" 
            alt="Logo" 
            width={120}  // Slightly larger for better visibility
            height={40}  // Match your logo's aspect ratio
            className="h-auto w-[100px] sm:w-[120px]" // Responsive sizing
            priority
          />
        </div>
      </div>
    </header>
  );
}

export default InterviewHeader;
