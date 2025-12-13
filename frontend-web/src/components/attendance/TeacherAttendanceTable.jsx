import React from "react";
import { Check, X } from "lucide-react";

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
    subjectName, // New prop
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
            "flex-1 py-2 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 first:rounded-l-lg last:rounded-r-lg";

        if (!isActive)
            return `${baseClass} bg-white text-gray-400 hover:bg-gray-50 border border-gray-200`;

        switch (type) {
            case "present":
                return `${baseClass} bg-blue-100 text-blue-700 border border-blue-200 shadow-sm`;
            case "absent":
                return `${baseClass} bg-rose-100 text-rose-700 border-rose-200 shadow-sm`;
            default:
                return baseClass;
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header Actions */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                <div>
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        Student List
                        {subjectName && (
                            <span className="text-sm font-normal text-black bg-white border border-gray-200 px-2 py-0.5 rounded-md">
                                {subjectName}
                            </span>
                        )}
                    </h3>
                    <p className="text-xs text-black mt-0.5">
                        Total Students: {students.length}
                    </p>
                </div>
                {(!isSubmitted || isAdmin) && (
                    <button
                        onClick={handleMarkAllPresent}
                        className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-0 gap-2 normal-case font-normal"
                    >
                        <Check className="w-4 h-4" />
                        Mark All Present
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-black text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4 w-16 text-center">#</th>
                            <th className="px-6 py-4">Student Name</th>
                            <th className="px-6 py-4 w-1/3 min-w-[200px] text-center">
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
                                const currentStatus = attendanceData[student.id]; // No default fallback
                                const isDisabled = isSubmitted && !isAdmin;

                                return (
                                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-center text-black font-medium text-sm">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="avatar placeholder">
                                                    <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                                                        {student.first_name[0]}
                                                        {student.last_name[0]}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-black text-sm">
                                                        {student.first_name} {student.last_name}
                                                    </p>
                                                    <p className="text-xs text-black">{student.roll_number}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 max-w-[200px] mx-auto">
                                                <button
                                                    disabled={isDisabled}
                                                    onClick={() => onAttendanceChange(student.id, "present")}
                                                    className={`flex-1 btn btn-sm border-0 ${currentStatus === 'present'
                                                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-400'
                                                        }`}
                                                    title="Present"
                                                >
                                                    <Check className="w-5 h-5" />
                                                </button>
                                                <button
                                                    disabled={isDisabled}
                                                    onClick={() => onAttendanceChange(student.id, "absent")}
                                                    className={`flex-1 btn btn-sm border-0 ${currentStatus === 'absent'
                                                        ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md'
                                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-400'
                                                        }`}
                                                    title="Absent"
                                                >
                                                    <X className="w-5 h-5" />
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
