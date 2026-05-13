"use client";

import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface PreferencesFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export default function PreferencesForm({ onSubmit, isLoading }: PreferencesFormProps) {
  const [formData, setFormData] = useState({
    location: "Bellandur",
    budget_bucket: "high",
    cuisine: "",
    cravings: "",
    min_rating: "4.0",
    additional_preferences: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      min_rating: parseFloat(formData.min_rating),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
        <input 
          type="text" name="location" 
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
          value={formData.location} onChange={handleChange} 
          placeholder="Enter location" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Cuisine</label>
        <input 
          type="text" name="cuisine" 
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
          value={formData.cuisine} onChange={handleChange} 
          placeholder="Enter cuisine type" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Specific Cravings</label>
        <input 
          type="text" name="cravings" 
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
          value={formData.cravings || ""} onChange={handleChange} 
          placeholder="e.g. spicy food, pasta, biryani, sushi" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Budget for two</label>
        <select name="budget_bucket" className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" value={formData.budget_bucket} onChange={handleChange}>
          <option value="low">Below ₹500</option>
          <option value="medium">₹500 - ₹1000</option>
          <option value="high">Above ₹1000</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, min_rating: star.toString() })}
              className={`text-2xl transition-colors ${
                star <= parseFloat(formData.min_rating) 
                  ? 'text-yellow-400' 
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              ★
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">Minimum {formData.min_rating} stars</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Additional Preferences</label>
        <textarea 
          name="additional_preferences" 
          rows={3} 
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none" 
          value={formData.additional_preferences} onChange={handleChange} 
          placeholder="e.g. romantic vibe, outdoor seating, good for families" 
        ></textarea>
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Finding restaurants...</span>
          </>
        ) : (
          <>
            <Search size={20} />
            <span>Get Recommendations</span>
          </>
        )}
      </button>
    </form>
  );
}
