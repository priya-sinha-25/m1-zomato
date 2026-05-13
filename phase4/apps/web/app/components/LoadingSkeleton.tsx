import React from 'react';

export default function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="glass-panel p-6 animate-pulse">
          <div className="flex justify-between items-start mb-4">
            <div className="h-6 bg-white/10 rounded w-1/2"></div>
            <div className="h-6 bg-white/10 rounded w-12 ml-2"></div>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="h-4 bg-white/10 rounded w-1/3"></div>
            <div className="h-4 bg-white/10 rounded w-1/4"></div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="h-3 bg-white/10 rounded w-1/4 mb-3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-white/10 rounded w-full"></div>
              <div className="h-3 bg-white/10 rounded w-full"></div>
              <div className="h-3 bg-white/10 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
