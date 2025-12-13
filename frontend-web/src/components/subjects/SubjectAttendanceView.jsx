import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Calendar, AlertTriangle, CheckCircle, Plus } from "lucide-react";
import { attendanceAPI } from "../../lib/api";
import Modal from "../common/Modal";

/**
 * SubjectAttendanceView Component
 * Displays student's attendance for a specific subject with color-coded warnings
 * Green: >80%, Yellow: 60-80%, Red: <60%
 */
const SubjectAttendanceView = ({
  subjectId,
  subjectName,
  classId,
  sectionId,
  onClose,
}) => {
  const user = useSelector((state) => state.auth.user);
  const studentId = user?.details?.id;
  const navigate = useNavigate();

  // Fetch subject-specific attendance
  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ["subject-attendance", studentId, subjectId],
    queryFn: () =>
      attendanceAPI.get({
        student_id: studentId,
        subject_id: subjectId,
      }),
    enabled: !!studentId,
  });

  // Fetch subject-specific stats
  const { data: statsData } = useQuery({
    queryKey: ["subject-attendance-stats", studentId, subjectId],
    queryFn: () =>
      attendanceAPI.getStats({
        student_id: studentId,
        subject_id: subjectId,
      }),
    enabled: !!studentId,
  });

  const attendanceRecords = attendanceData?.data || [];
  const stats = statsData?.data || {
    total_days: 0,
    present_count: 0,
    absent_count: 0,
    late_count: 0,
    excused_count: 0,
    attendance_percentage: 0,
  };

  // Determine warning level based on percentage
  const getWarningLevel = (percentage) => {
    if (percentage >= 80) return "good";
    if (percentage >= 60) return "warning";
    return "danger";
  };

  const warningLevel = getWarningLevel(stats.attendance_percentage);

  const warningConfig = {
    good: {
      color: "text-green-600",
      bgColor: "bg-green-100",
      borderColor: "border-green-500",
      icon: CheckCircle,
      message: "Excellent attendance!",
      textColor: "text-green-800",
    },
    warning: {
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      borderColor: "border-yellow-500",
      icon: AlertTriangle,
      message: "Attendance needs improvement",
      textColor: "text-yellow-800",
    },
    danger: {
      color: "text-red-600",
      bgColor: "bg-red-100",
      borderColor: "border-red-500",
      icon: AlertTriangle,
      message: "Critical: Low attendance!",
      textColor: "text-red-800",
    },
  };

  const config = warningConfig[warningLevel];
  const WarningIcon = config.icon;

  // Handle navigation to Attendance page
  const handleNavigateToAttendance = () => {
    onClose(); // Close the modal first
    navigate('/attendance'); // Navigate to attendance page
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Attendance - ${subjectName}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Warning Banner */}
        <div
          className={`${config.bgColor} border-l-4 ${config.borderColor} p-4 rounded-lg`}
        >
          <div className="flex items-center gap-3">
            <WarningIcon className={`w-6 h-6 ${config.color}`} />
            <div>
              <p className={`font-semibold ${config.textColor}`}>
                {config.message}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Your attendance for this subject is{" "}
                {stats.attendance_percentage}%
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div
            onClick={handleNavigateToAttendance}
            className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all"
          >
            <p className="text-sm text-gray-600">Percentage</p>
            <p className={`text-3xl font-bold ${config.color}`}>
              {stats.attendance_percentage}%
            </p>
          </div>

          <div
            onClick={handleNavigateToAttendance}
            className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all"
          >
            <p className="text-sm text-gray-600">Present</p>
            <p className="text-3xl font-bold text-green-600">
              {stats.present_count}
            </p>
          </div>

          <div
            onClick={handleNavigateToAttendance}
            className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all"
          >
            <p className="text-sm text-gray-600">Absent</p>
            <p className="text-3xl font-bold text-red-600">
              {stats.absent_count}
            </p>
          </div>

          <div
            onClick={handleNavigateToAttendance}
            className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all"
          >
            <p className="text-sm text-gray-600">Total Days</p>
            <p className="text-3xl font-bold text-blue-600">
              {stats.total_days}
            </p>
          </div>

          {user?.role !== "student" && (
            <div
              onClick={handleNavigateToAttendance}
              className="bg-purple-50 border border-purple-200 rounded-lg p-4 cursor-pointer hover:bg-purple-100 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <Plus className="w-4 h-4 text-purple-600" />
                <p className="text-sm font-medium text-purple-800">Add</p>
              </div>
              <p className="text-sm font-medium text-purple-600 mt-2">
                Attendance
              </p>
            </div>
          )}
        </div>

        {/* Attendance History */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-4 border-b">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Attendance Records
            </h3>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="loading mx-auto"></div>
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No attendance records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="font-medium">
                        {new Date(record.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${record.status === "present"
                            ? "bg-green-100 text-green-800"
                            : record.status === "absent"
                              ? "bg-red-100 text-red-800"
                              : record.status === "late"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                        >
                          {record.status === "excused"
                            ? "Leave"
                            : record.status}
                        </span>
                      </td>
                      <td className="text-sm text-gray-600">
                        {record.remarks || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SubjectAttendanceView;
