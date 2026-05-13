"use client";

import React from 'react';

export default function Home() {
  return (
    <main className="min-h-screen bg-soft-cream dark:bg-deep-midnight-blue text-deep-midnight-blue dark:text-soft-cream transition-colors duration-300 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background organic breathe animation element */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[40vw] h-[40vw] bg-soft-indigo/20 dark:bg-soft-indigo/10 rounded-full blur-3xl animate-organic-breathe"></div>
      </div>

      {/* Main Content Area */}
      <div className="z-10 w-full max-w-5xl px-6 lg:px-8">
        {/* Drop in your client-side React component here */}
      </div>
    </main>
  );
}
