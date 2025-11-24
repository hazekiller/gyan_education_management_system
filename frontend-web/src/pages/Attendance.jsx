// File: frontend-web/src/pages/Attendance.jsx
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Check,
  X,
  Clock,
  Lock,
  Unlock,
  AlertCircle,
  Info,
} from "lucide-react";
import { useSelector } from "react-redux";
import { attendanceAPI, classesAPI, studentsAPI } from "../lib/api";
import toast from "react-hot-toast";
import { selectCurrentUser, selectUserRole } from "../store/slices/authSlice";

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [attendanceData, setAttendanceData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionInfo, setSubmissionInfo] = useState(null);

  const queryClient = useQueryClient();
  const currentUser = useSelector(selectCurrentUser);
  const userRole = useSelector(selectUserRole);

  // Check if user is admin
  const isAdmin = ["super_admin", "principal", "vice_principal"].includes(
    userRole
  );

  // Fetch classes (role-based)
  const { data: classesData } = useQuery({
    queryKey: ["my-classes"],
    queryFn: classesAPI.getMyClasses,
  });

  const classes = classesData?.data || [];

  // Fetch sections when class is selected (role-based)
  const { data: sectionsData } = useQuery({
    queryKey: ["my-sections", selectedClass],
    queryFn: () => classesAPI.getMySections(selectedClass),
    enabled: !!selectedClass,
  });

  const sections = sectionsData?.data || [];

  // Fetch students when class and section are selected
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["students", selectedClass, selectedSection],
    queryFn: () =>
      studentsAPI.getAll({
        class_id: selectedClass,
        section_id: selectedSection,
        status: "active",
      }),
    enabled: !!selectedClass && !!selectedSection,
  });

  const students = studentsData?.data || [];

  // Fetch existing attendance
  const { data: existingAttendance, refetch: refetchAttendance } = useQuery({
    queryKey: ["attendance", selectedClass, selectedSection, selectedDate],
    queryFn: () =>
      attendanceAPI.get({
        class_id: selectedClass,
        section_id: selectedSection,
        date: selectedDate,
      }),
    enabled: !!selectedClass && !!selectedSection && !!selectedDate,
  });

  // Check submission status
  const { data: submissionStatus } = useQuery({
    queryKey: [
      "attendance-submission",
      selectedClass,
      selectedSection,
      selectedDate,
    ],
    queryFn: () =>
      attendanceAPI.checkSubmission({
        class_id: selectedClass,
        section_id: selectedSection,
        date: selectedDate,
      }),
    enabled: !!selectedClass && !!selectedSection && !!selectedDate,
  });

  // Update submission status
  useEffect(() => {
    if (submissionStatus?.data) {
      setIsSubmitted(submissionStatus.data.is_submitted || false);
      setSubmissionInfo(submissionStatus.data);
    }
  }, [submissionStatus]);

  // Initialize attendance data when students or existing attendance changes
  useEffect(() => {
    if (students.length > 0) {
      const newAttendanceData = {};

      students.forEach((student) => {
        const existing = existingAttendance?.data?.find(
          (a) => a.student_id === student.id
        );
        newAttendanceData[student.id] = existing?.status || "present";
      });

      setAttendanceData(newAttendanceData);
    }
  }, [students, existingAttendance]);

  const handleAttendanceChange = (studentId, status) => {
    // Don't allow changes if submitted and not admin
    if (isSubmitted && !isAdmin) {
      toast.error(
        "Attendance is already submitted. Contact admin to make changes."
      );
      return;
    }

    setAttendanceData({
      ...attendanceData,
      [studentId]: status,
    });
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || !selectedSection) {
      toast.error("Please select class and section");
      return;
    }

    if (isSubmitted && !isAdmin) {
      toast.error(
        "Attendance is already submitted. Contact admin to make changes."
      );
      return;
    }

    const attendanceRecords = Object.entries(attendanceData).map(
      ([studentId, status]) => ({
        student_id: parseInt(studentId),
        class_id: parseInt(selectedClass),
        section_id: parseInt(selectedSection),
        date: selectedDate,
        status,
        remarks: "",
      })
    );

    setSubmitting(true);
    try {
      await attendanceAPI.mark({ attendanceRecords });
      toast.success("Attendance saved successfully");
      refetchAttendance();
      queryClient.invalidateQueries(["attendance-submission"]);
    } catch (error) {
      toast.error(error.message || "Failed to save attendance");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAttendance = async () => {
    if (!selectedClass || !selectedSection) {
      toast.error("Please select class and section");
      return;
    }

    if (isSubmitted) {
      toast.error("Attendance is already submitted");
      return;
    }

    // First save the attendance
    const attendanceRecords = Object.entries(attendanceData).map(
      ([studentId, status]) => ({
        student_id: parseInt(studentId),
        class_id: parseInt(selectedClass),
        section_id: parseInt(selectedSection),
        date: selectedDate,
        status,
        remarks: "",
      })
    );

    setSubmitting(true);
    try {
      // Save attendance first
      await attendanceAPI.mark({ attendanceRecords });

      // Then submit it
      await attendanceAPI.submit({
        class_id: parseInt(selectedClass),
        section_id: parseInt(selectedSection),
        date: selectedDate,
      });

      toast.success("Attendance submitted and locked successfully");
      setIsSubmitted(true);
      refetchAttendance();
      queryClient.invalidateQueries(["attendance-submission"]);
    } catch (error) {
      toast.error(error.message || "Failed to submit attendance");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlockAttendance = async () => {
    if (!isAdmin) {
      toast.error("Only administrators can unlock attendance");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to unlock this attendance? Teachers will be able to modify it again."
      )
    ) {
      return;
    }

    setSubmitting(true);
    try {
      await attendanceAPI.unlock({
        class_id: parseInt(selectedClass),
        section_id: parseInt(selectedSection),
        date: selectedDate,
      });

      toast.success("Attendance unlocked successfully");
      setIsSubmitted(false);
      refetchAttendance();
      queryClient.invalidateQueries(["attendance-submission"]);
    } catch (error) {
      toast.error(error.message || "Failed to unlock attendance");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusCounts = () => {
    const counts = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    };

    Object.values(attendanceData).forEach((status) => {
      if (counts.hasOwnProperty(status)) {
        counts[status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Attendance Management
        </h1>
        <p className="text-gray-600 mt-1">Mark and manage student attendance</p>
      </div>

      {/* Submission Status Alert */}
      {isSubmitted && selectedClass && selectedSection && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Lock className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800">
                Attendance Submitted
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  This attendance was submitted on{" "}
                  {submissionInfo?.submitted_at
                    ? new Date(submissionInfo.submitted_at).toLocaleString()
                    : "N/A"}
                  {submissionInfo?.submitted_by_email &&
                    ` by ${submissionInfo.submitted_by_email}`}
                </p>
                {!isAdmin && (
                  <p className="mt-1">
                    <Info className="inline h-4 w-4 mr-1" />
                    Only administrators can modify submitted attendance.
                  </p>
                )}
              </div>
            </div>
            {isAdmin && (
              <button
                onClick={handleUnlockAttendance}
                disabled={submitting}
                className="ml-3 flex-shrink-0 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Unlock className="h-4 w-4 mr-1" />
                Unlock
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input"
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection("");
              }}
              className="input"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="input"
              disabled={!selectedClass}
            >
              <option value="">Select Section</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleSaveAttendance}
              disabled={
                submitting || students.length === 0 || (isSubmitted && !isAdmin)
              }
              className="btn btn-secondary flex-1 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleSubmitAttendance}
              disabled={submitting || students.length === 0 || isSubmitted}
              className="btn btn-primary flex-1 disabled:opacity-50"
            >
              {submitting
                ? "Submitting..."
                : isSubmitted
                ? "Submitted"
                : "Submit"}
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {students.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-600">
                  {statusCounts.present}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">
                  {statusCounts.absent}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <X className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Late</p>
                <p className="text-2xl font-bold text-orange-600">
                  {statusCounts.late}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Excused</p>
                <p className="text-2xl font-bold text-blue-600">
                  {statusCounts.excused}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Students List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {!selectedClass || !selectedSection ? (
          <div className="p-12 text-center text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Please select class and section to view students</p>
          </div>
        ) : studentsLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loading"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No students found in this class</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Roll No.</th>
                  <th>Student Name</th>
                  <th>Admission No.</th>
                  <th className="text-center">
                    Status
                    {isSubmitted && (
                      <Lock className="inline-block w-4 h-4 ml-2 text-blue-500" />
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className={isSubmitted && !isAdmin ? "opacity-75" : ""}
                  >
                    <td className="font-medium">{student.roll_number}</td>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {student.first_name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium">
                          {student.first_name} {student.last_name}
                        </span>
                      </div>
                    </td>
                    <td>{student.admission_number}</td>
                    <td>
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() =>
                            handleAttendanceChange(student.id, "present")
                          }
                          disabled={isSubmitted && !isAdmin}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            attendanceData[student.id] === "present"
                              ? "bg-green-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          } disabled:cursor-not-allowed disabled:hover:bg-gray-100`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() =>
                            handleAttendanceChange(student.id, "absent")
                          }
                          disabled={isSubmitted && !isAdmin}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            attendanceData[student.id] === "absent"
                              ? "bg-red-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          } disabled:cursor-not-allowed disabled:hover:bg-gray-100`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() =>
                            handleAttendanceChange(student.id, "late")
                          }
                          disabled={isSubmitted && !isAdmin}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            attendanceData[student.id] === "late"
                              ? "bg-orange-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          } disabled:cursor-not-allowed disabled:hover:bg-gray-100`}
                        >
                          Late
                        </button>
                        <button
                          onClick={() =>
                            handleAttendanceChange(student.id, "excused")
                          }
                          disabled={isSubmitted && !isAdmin}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            attendanceData[student.id] === "excused"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          } disabled:cursor-not-allowed disabled:hover:bg-gray-100`}
                        >
                          Excused
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
