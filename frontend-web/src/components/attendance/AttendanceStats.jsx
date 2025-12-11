import React from "react";
import { Check, X, Clock, AlertCircle } from "lucide-react";

/**
 * AttendanceStats Component
 * precise stats with a visual ring for overall percentage
 */
const AttendanceStats = ({ stats }) => {
  const {
    present_count = 0,
    absent_count = 0,
    late_count = 0,
    excused_count = 0,
    total_days = 0,
    attendance_percentage = 0,
  } = stats;

  // Calculate stroke dashoffset for the circular progress
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (attendance_percentage / 100) * circumference;

  // Color config based on percentage
  const getColor = (percent) => {
    if (percent >= 80) return "text-emerald-500";
    if (percent >= 75) return "text-yellow-500";
    return "text-rose-500";
  };

  const ringColor = getColor(attendance_percentage);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Overall Percentage Card */}
      <div className="md:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden">
        <div className="z-10">
          <h3 className="text-gray-500 font-medium text-sm mb-1 uppercase tracking-wider">
            Overall Attendance
          </h3>
          <div className="text-4xl font-bold text-gray-800">
            {attendance_percentage}%
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Total {total_days} working days
          </p>
        </div>

        {/* Circular Progress */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="transform -rotate-90 w-24 h-24">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-100"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={
                2 * Math.PI * 40 -
                (attendance_percentage / 100) * 2 * Math.PI * 40
              }
              className={`${ringColor} transition-all duration-1000 ease-out`}
              strokeLinecap="round"
            />
          </svg>
        </div>
        
        {/* Background Decoration */}
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gray-50 rounded-full z-0" />
      </div>

      {/* Detailed Stats Grid */}
      <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Present */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
            <Check className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-gray-800">
            {present_count}
          </span>
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            Present
          </span>
        </div>

        {/* Absent */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-2">
            <X className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-gray-800">
            {absent_count}
          </span>
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            Absent
          </span>
        </div>

        {/* Late */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mb-2">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-gray-800">
            {late_count}
          </span>
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            Late
          </span>
        </div>

        {/* Excused */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
            <AlertCircle className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-gray-800">
            {excused_count}
          </span>
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            Excused
          </span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceStats;
