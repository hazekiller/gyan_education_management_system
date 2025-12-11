import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * StudentAttendanceCalendar Component
 * Displays a monthly calendar with attendance status markers
 */
const StudentAttendanceCalendar = ({
    attendanceList,
    viewMonth,
    viewYear,
    onMonthChange,
    onYearChange,
}) => {
    // Helpers
    const getDaysInMonth = (year, month) =>
        new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) =>
        new Date(year, month, 1).getDay();

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];

    // Map attendance by date string (YYYY-MM-DD)
    const attendanceMap = attendanceList.reduce((acc, record) => {
        const dateStr = new Date(record.date).toISOString().split("T")[0];
        acc[dateStr] = record;
        return acc;
    }, {});

    const prevMonth = () => {
        if (viewMonth === 0) {
            onMonthChange(11);
            onYearChange(viewYear - 1);
        } else {
            onMonthChange(viewMonth - 1);
        }
    };

    const nextMonth = () => {
        if (viewMonth === 11) {
            onMonthChange(0);
            onYearChange(viewYear + 1);
        } else {
            onMonthChange(viewMonth + 1);
        }
    };

    // Status style mapping
    const getStatusStyle = (status) => {
        switch (status) {
            case "present":
                return "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200";
            case "absent":
                return "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200";
            case "late":
                return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200";
            case "excused":
                return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200";
            default:
                return "bg-gray-50 text-gray-500 hover:bg-gray-100";
        }
    };

    const renderCalendarDays = () => {
        const days = [];
        // Empty cells for days before the 1st
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50/50" />);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const record = attendanceMap[dateStr];
            const statusClass = record ? getStatusStyle(record.status) : "bg-white hover:bg-gray-50";

            days.push(
                <div
                    key={day}
                    className={`h-24 p-2 border border-gray-100 relative transition-colors group ${statusClass} ${record ? "cursor-default" : ""
                        }`}
                >
                    <span className={`text-sm font-medium ${record ? "" : "text-gray-700"}`}>
                        {day}
                    </span>

                    {record && (
                        <div className="mt-1">
                            <span className="text-xs font-semibold capitalize block truncate">
                                {record.status}
                            </span>
                            {record.remarks && (
                                <p className="text-[10px] mt-1 line-clamp-2 opacity-80 leading-tight">
                                    {record.remarks}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Simple Tooltip on Hover if needed */}
                </div>
            );
        }
        return days;
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                <h2 className="text-lg font-bold text-gray-800">Attendance Calendar</h2>
                <div className="flex items-center gap-4">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-lg font-medium text-gray-700 w-32 text-center select-none">
                        {months[viewMonth]} {viewYear}
                    </span>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div
                        key={day}
                        className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 bg-white">
                {renderCalendarDays()}
            </div>
        </div>
    );
};

export default StudentAttendanceCalendar;
