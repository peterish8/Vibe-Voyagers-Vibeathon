"use client";

import { motion } from "framer-motion";
import { TrendingUp, BarChart3, Brain } from "lucide-react";

export default function InsightsPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass text-center py-16"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-purple-100">
            <Brain className="w-12 h-12 text-purple-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-serif font-semibold text-gray-900 mb-4">
          Insights Coming Soon
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          We need more data to generate meaningful insights about your habits, tasks, and productivity patterns. 
          Keep using the app for a few more days!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="p-3 rounded-full bg-green-100 w-fit mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Habit Tracking</h3>
            <p className="text-sm text-gray-600">Complete habits for 7+ days to see patterns</p>
          </div>
          
          <div className="text-center">
            <div className="p-3 rounded-full bg-blue-100 w-fit mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Task Analysis</h3>
            <p className="text-sm text-gray-600">Create and complete tasks to analyze productivity</p>
          </div>
          
          <div className="text-center">
            <div className="p-3 rounded-full bg-purple-100 w-fit mx-auto mb-3">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Insights</h3>
            <p className="text-sm text-gray-600">Get personalized recommendations and trends</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}