import React from 'react';
import { Star, MapPin, Utensils, IndianRupee, Clock, DollarSign } from 'lucide-react';

export default function RestaurantCard({ restaurant }: { restaurant: any }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:bg-gray-800 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white leading-tight mb-1">{restaurant.restaurant_name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Utensils size={14} />
            <span>{restaurant.cuisine || "Various"}</span>
            <span>•</span>
            <span>{restaurant.location || "Location"}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-lg text-sm font-bold">
          <Star size={14} className="fill-current" />
          <span>{restaurant.rating?.toFixed(1) || "4.0"}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
            <IndianRupee size={16} className="text-gray-300" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Cost for two</p>
            <p className="text-sm font-semibold text-white">₹{restaurant.estimated_cost_for_two || "800"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
            <Clock size={16} className="text-gray-300" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Delivery time</p>
            <p className="text-sm font-semibold text-white">30-40 min</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">20% OFF</span>
          <span className="text-xs text-gray-500">Free delivery</span>
        </div>
        <button className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">
          View menu →
        </button>
      </div>
      
      {restaurant.explanation && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Why AI recommends this</h4>
          <p className="text-sm text-gray-400 leading-relaxed italic">"{restaurant.explanation}"</p>
        </div>
      )}
    </div>
  );
}
