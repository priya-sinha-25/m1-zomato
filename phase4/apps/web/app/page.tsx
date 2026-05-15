"use client";

import React, { useState } from 'react';
import PreferencesForm from './components/PreferencesForm';
import RestaurantCard from './components/RestaurantCard';
import LoadingSkeleton from './components/LoadingSkeleton';

export default function Home() {
  const [recommendations, setRecommendations] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'fallback' | null, message: string }>({ type: null, message: "" });
  const [telemetry, setTelemetry] = useState<any>(null);

  const handleFetchRecommendations = async (payload: any) => {
    setIsLoading(true);
    setStatus({ type: null, message: "" });
    setRecommendations(null);
    setTelemetry(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${apiUrl}/api/v1/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        setRecommendations(result.data);
        if (result.telemetry) setTelemetry(result.telemetry);
      } else if (result.status === 'empty') {
        setStatus({ type: 'fallback', message: result.message || "No matches found." });
      } else {
        setStatus({ type: 'error', message: result.message || "An error occurred." });
      }
    } catch (err) {
      setStatus({ type: 'error', message: "Failed to connect to the recommendation API. Is the FastAPI server running?" });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Zomato AI</h1>
            <nav className="flex items-center space-x-6 text-gray-400 text-sm">
              <span className="hover:text-white cursor-pointer transition-colors">Login</span>
              <span className="hover:text-white cursor-pointer transition-colors">Sign up</span>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Find your best restaurant</h2>
              <PreferencesForm onSubmit={handleFetchRecommendations} isLoading={isLoading} />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            {status.message && (
              <div className={`mb-6 p-4 rounded-lg border ${
                status.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-200' : 
                'bg-yellow-500/10 border-yellow-500/50 text-yellow-200'
              }`}>
                {status.message}
              </div>
            )}

            <div className="space-y-4" id="recommendations-grid">
              {isLoading ? (
                <LoadingSkeleton />
              ) : recommendations ? (
                recommendations.map((rec, i) => (
                  <RestaurantCard key={i} restaurant={rec} />
                ))
              ) : !status.message && (
                <div className="py-20 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-700 rounded-2xl">
                  <p className="text-lg">Fill out your preferences to see AI recommendations</p>
                </div>
              )}
            </div>

            {telemetry && (
              <div className="mt-8 pt-8 border-t border-gray-800">
                <p className="text-xs text-gray-500 font-mono">
                  Candidates filtered: {telemetry.candidates_found}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
