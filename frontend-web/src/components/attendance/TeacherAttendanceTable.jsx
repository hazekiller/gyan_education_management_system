import React from "react";
import { Check, X, Clock, AlertCircle } from "lucide-react";

/**
 * TeacherAttendanceTable Component
 * Optimized list for marking attendance quickly.
 */
const TeacherAttendanceTable = ({
    students,
    attendanceData,
    onAttendanceChange,
    isSubmitted,
    isAdmin,
}) => {
    // Quick action to mark all present
    const handleMarkAllPresent = () => {
        if (isSubmitted && !isAdmin) return;
        students.forEach((student) => {
            onAttendanceChange(student.id, "present");
        });
    };

    const getStatusButtonClass = (isActive, type) => {
        const baseClass =
            "flex-1 py-2 text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1 border-r last:border-r-0 first:rounded-l-lg last:rounded-r-lg";

        if (!isActive)
            return `${baseClass} bg-white text-gray-500 hover:bg-gray-50 border-gray-200`;

        switch (type) {
            case "present":
                return `${baseClass} bg-emerald-100 text-emerald-700 border-emerald-200 shadow-inner`;
            case "absent":
                return `${baseClass} bg-rose-100 text-rose-700 border-rose-200 shadow-inner`;
            case "late":
                return `${baseClass} bg-yellow-100 text-yellow-700 border-yellow-200 shadow-inner`;
            case "excused":
                return `${baseClass} bg-blue-100 text-blue-700 border-blue-200 shadow-inner`;
            default:
                return baseClass;
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header Actions */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                <div>
                    <h3 className="font-semibold text-gray-800">Student List</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Total Students: {students.length}
                    </p>
                </div>
                {(!isSubmitted || isAdmin) && (
                    <button
                        onClick={handleMarkAllPresent}
                        className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0 gap-2 normal-case font-normal"
                    >
                        <Check className="w-4 h-4" />
                        Mark All Present
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4 w-16 text-center">#</th>
                            <th className="px-6 py-4">Student Name</th>
                            <th className="px-6 py-4 w-1/2 min-w-[300px] text-center">
                                Attendance Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center text-gray-400">
                                    No students found in this class.
                                </td>
                            </tr>
                        ) : (
                            students.map((student, index) => {
                                const currentStatus = attendanceData[student.id] || "present"; // Default visual fallback
                                const isDisabled = isSubmitted && !isAdmin;

                                return (
                                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-center text-gray-500 font-medium text-sm">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="avatar placeholder">
                                                    <div className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                                                        {student.first_name[0]}
                                                        {student.last_name[0]}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800 text-sm">
                                                        {student.first_name} {student.last_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{student.roll_number}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex rounded-lg border border-gray-200 shadow-sm max-w-md mx-auto">
                                                <button
                                                    disabled={isDisabled}
                                                    onClick={() => onAttendanceChange(student.id, "present")}
                                                    className={getStatusButtonClass(
                                                        currentStatus === "present",
                                                        "present"
                                                    )}
                                                    title="Present"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Present</span>
                                                </button>
                                                <button
                                                    disabled={isDisabled}
                                                    onClick={() => onAttendanceChange(student.id, "absent")}
                                                    className={getStatusButtonClass(
                                                        currentStatus === "absent",
                                                        "absent"
                                                    )}
                                                    title="Absent"
                                                >
                                                    <X className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Absent</span>
                                                </button>
                                                <button
                                                    disabled={isDisabled}
                                                    onClick={() => onAttendanceChange(student.id, "late")}
                                                    className={getStatusButtonClass(
                                                        currentStatus === "late",
                                                        "late"
                                                    )}
                                                    title="Late"
                                                >
                                                    <Clock className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Late</span>
                                                </button>
                                                <button
                                                    disabled={isDisabled}
                                                    onClick={() => onAttendanceChange(student.id, "excused")}
                                                    className={getStatusButtonClass(
                                                        currentStatus === "excused",
                                                        "excused"
                                                    )}
                                                    title="Excused"
                                                >
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Excused</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeacherAttendanceTable;
