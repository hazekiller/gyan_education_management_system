import { useState, useEffect, useMemo } from "react";
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
  BookOpen,
} from "lucide-react";
import { useSelector } from "react-redux";
import {
  attendanceAPI,
  classesAPI,
  studentsAPI,
  classSubjectsAPI,
} from "../lib/api";
import toast from "react-hot-toast";
import { selectCurrentUser, selectUserRole } from "../store/slices/authSlice";

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
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

  // Fetch subjects when section is selected
  const { data: subjectsData } = useQuery({
    queryKey: ["section-subjects", selectedSection],
    queryFn: () => classSubjectsAPI.getBySection(selectedSection),
    enabled: !!selectedSection,
  });

  const allSubjects = subjectsData?.data || [];

  // Filter subjects for teachers
  const subjects =
    userRole === "teacher"
      ? allSubjects.filter(
          (s) =>
            s.section_teacher_email === currentUser?.email ||
            (!s.section_teacher_email &&
              s.default_teacher_email === currentUser?.email)
        )
      : allSubjects;

  // For teachers, check if marking for today
  const isMarkingForToday = useMemo(() => {
    return selectedDate === new Date().toISOString().split("T")[0];
  }, [selectedDate]);

  // Fetch schedule for the selected subject to check time validity
  const { data: scheduleData } = useQuery({
    queryKey: [
      "subject-schedule",
      selectedClass,
      selectedSection,
      selectedSubject,
    ],
    queryFn: async () => {
      if (!selectedClass || !selectedSection || !selectedSubject) return null;

      // Get current day of week
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const today = days[new Date().getDay()];

      // Fetch teacher's schedule for this subject
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/timetable?class_id=${selectedClass}&section_id=${selectedSection}&subject_id=${selectedSubject}&day_of_week=${today}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) return null;
      const data = await response.json();
      return data.data && data.data.length > 0 ? data.data[0] : null;
    },
    enabled:
      !!selectedClass &&
      !!selectedSection &&
      !!selectedSubject &&
      isMarkingForToday &&
      userRole === "teacher",
    refetchInterval: 60000, // Refetch every minute to keep time check updated
  });

  // Check if current time is within the scheduled class time
  const isWithinScheduledTime = useMemo(() => {
    if (isAdmin) return true; // Admins can mark anytime
    if (!isMarkingForToday) return false; // Must be today
    if (!scheduleData) return false; // Must have schedule data

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes since midnight

    // Parse schedule times (format: "HH:MM:SS")
    const [startHour, startMin] = scheduleData.start_time
      .split(":")
      .map(Number);
    const [endHour, endMin] = scheduleData.end_time.split(":").map(Number);

    const scheduleStart = startHour * 60 + startMin;
    const scheduleEnd = endHour * 60 + endMin;

    // Check if current time is within schedule (inclusive)
    return currentTime >= scheduleStart && currentTime <= scheduleEnd;
  }, [scheduleData, isMarkingForToday, isAdmin]);

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
    queryKey: [
      "attendance",
      selectedClass,
      selectedSection,
      selectedSubject,
      selectedDate,
    ],
    queryFn: () =>
      attendanceAPI.get({
        class_id: selectedClass,
        section_id: selectedSection,
        subject_id: selectedSubject,
        date: selectedDate,
      }),
    enabled:
      !!selectedClass &&
      !!selectedSection &&
      !!selectedSubject &&
      !!selectedDate,
  });

  // Check submission status
  const { data: submissionStatus } = useQuery({
    queryKey: [
      "attendance-submission",
      selectedClass,
      selectedSection,
      selectedSubject,
      selectedDate,
    ],
    queryFn: () =>
      attendanceAPI.checkSubmission({
        class_id: selectedClass,
        section_id: selectedSection,
        subject_id: selectedSubject,
        date: selectedDate,
      }),
    enabled:
      !!selectedClass &&
      !!selectedSection &&
      !!selectedSubject &&
      !!selectedDate,
  });

  // Update submission status
  useEffect(() => {
    if (submissionStatus?.data) {
      setIsSubmitted(submissionStatus.data.is_submitted || false);
      setSubmissionInfo(submissionStatus.data);
    } else {
      setIsSubmitted(false);
      setSubmissionInfo(null);
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
    if (!selectedClass || !selectedSection || !selectedSubject) {
      toast.error("Please select class, section, and subject");
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
      await attendanceAPI.mark({
        date: selectedDate,
        subject_id: parseInt(selectedSubject),
        attendance_records: attendanceRecords,
      });
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
    if (!selectedClass || !selectedSection || !selectedSubject) {
      toast.error("Please select class, section, and subject");
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
      await attendanceAPI.mark({
        date: selectedDate,
        subject_id: parseInt(selectedSubject),
        attendance_records: attendanceRecords,
      });

      // Then submit it
      await attendanceAPI.submit({
        class_id: parseInt(selectedClass),
        section_id: parseInt(selectedSection),
        subject_id: parseInt(selectedSubject),
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
        subject_id: parseInt(selectedSubject),
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

  // Student View
  if (userRole === "student") {
    const [viewMonth, setViewMonth] = useState(new Date().getMonth());
    const [viewYear, setViewYear] = useState(new Date().getFullYear());
    const [expandedWeeks, setExpandedWeeks] = useState(new Set());

    const getMonthDateRange = (year, month) => {
      const startDate = new Date(year, month, 1).toISOString().split("T")[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];
      return { startDate, endDate };
    };

    const { startDate, endDate } = getMonthDateRange(viewYear, viewMonth);

    const { data: myAttendance } = useQuery({
      queryKey: ["my-attendance", startDate, endDate],
      queryFn: () =>
        attendanceAPI.get({ start_date: startDate, end_date: endDate }),
    });

    const { data: myStats } = useQuery({
      queryKey: ["my-attendance-stats", startDate, endDate],
      queryFn: () =>
        attendanceAPI.getStats({ start_date: startDate, end_date: endDate }),
    });

    const attendanceList = myAttendance?.data || [];
    const stats = myStats?.data || {
      total_days: 0,
      present_count: 0,
      absent_count: 0,
      late_count: 0,
      excused_count: 0,
      attendance_percentage: 0,
    };

    // Group attendance by week
    const groupedByWeek = useMemo(() => {
      const weeks = {};

      attendanceList.forEach((record) => {
        const date = new Date(record.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Sunday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // Saturday

        const weekKey = `${weekStart.toISOString().split("T")[0]}_${
          weekEnd.toISOString().split("T")[0]
        }`;

        if (!weeks[weekKey]) {
          weeks[weekKey] = {
            start: weekStart,
            end: weekEnd,
            records: [],
            stats: { present: 0, absent: 0, late: 0, excused: 0 },
          };
        }

        weeks[weekKey].records.push(record);
        weeks[weekKey].stats[record.status]++;
      });

      return Object.entries(weeks).sort((a, b) => b[1].start - a[1].start); // Most recent first
    }, [attendanceList]);

    const toggleWeek = (weekKey) => {
      const newExpanded = new Set(expandedWeeks);
      if (newExpanded.has(weekKey)) {
        newExpanded.delete(weekKey);
      } else {
        newExpanded.add(weekKey);
      }
      setExpandedWeeks(newExpanded);
    };

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const years = Array.from(
      { length: 5 },
      (_, i) => new Date().getFullYear() - i
    );

    // Quick filter functions
    const setQuickFilter = (type) => {
      const now = new Date();
      switch (type) {
        case "thisWeek":
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          setViewMonth(weekStart.getMonth());
          setViewYear(weekStart.getFullYear());
          break;
        case "thisMonth":
          setViewMonth(now.getMonth());
          setViewYear(now.getFullYear());
          break;
        case "last30Days":
          const last30 = new Date(now);
          last30.setDate(now.getDate() - 30);
          setViewMonth(last30.getMonth());
          setViewYear(last30.getFullYear());
          break;
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
            <p className="text-gray-600 mt-1">View your attendance history</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Quick Filters with Icons */}
            <div className="flex gap-2">
              <button
                onClick={() => setQuickFilter("thisWeek")}
                className="btn btn-sm btn-outline flex items-center gap-1"
                title="This Week"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Week</span>
              </button>
              <button
                onClick={() => setQuickFilter("thisMonth")}
                className="btn btn-sm btn-outline flex items-center gap-1"
                title="This Month"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Month</span>
              </button>
            </div>

            {/* Month/Year Selectors */}
            <div className="flex gap-2">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value))}
                className="input w-40"
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>
                    📅 {month}
                  </option>
                ))}
              </select>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value))}
                className="input w-32"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards - Updated with percentage next to Present */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Present</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-green-600">
                    {stats.present_count}
                  </p>
                  <span className="text-sm font-medium text-green-600">
                    ({stats.attendance_percentage}%)
                  </span>
                </div>
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
                  {stats.absent_count}
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
                  {stats.late_count}
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
                <p className="text-sm text-gray-600">Total Days</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.total_days}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Attendance History by Week */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Attendance History
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Grouped by week • Click to expand/collapse
            </p>
          </div>

          {groupedByWeek.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No attendance records found for this period</p>
            </div>
          ) : (
            <div className="divide-y">
              {groupedByWeek.map(([weekKey, weekData]) => {
                const isExpanded = expandedWeeks.has(weekKey);
                const weekLabel = `${weekData.start.toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric" }
                )} - ${weekData.end.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}`;

                return (
                  <div key={weekKey}>
                    {/* Week Header */}
                    <button
                      onClick={() => toggleWeek(weekKey)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900">
                            {weekLabel}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {weekData.records.length} day
                            {weekData.records.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Week Stats */}
                        <div className="flex gap-3 text-sm">
                          {weekData.stats.present > 0 && (
                            <span className="text-green-600 font-medium">
                              ✓ {weekData.stats.present}
                            </span>
                          )}
                          {weekData.stats.absent > 0 && (
                            <span className="text-red-600 font-medium">
                              ✗ {weekData.stats.absent}
                            </span>
                          )}
                          {weekData.stats.late > 0 && (
                            <span className="text-orange-600 font-medium">
                              ⏰ {weekData.stats.late}
                            </span>
                          )}
                        </div>

                        <span
                          className={`transform transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        >
                          ▼
                        </span>
                      </div>
                    </button>

                    {/* Week Details */}
                    {isExpanded && (
                      <div className="px-6 pb-4 bg-gray-50">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-xs text-gray-500 uppercase">
                              <th className="py-2">Date</th>
                              <th>Subject</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {weekData.records.map((record) => (
                              <tr key={record.id} className="text-sm">
                                <td className="py-3 font-medium">
                                  {new Date(record.date).toLocaleDateString(
                                    "en-US",
                                    {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                                </td>
                                <td className="text-gray-600">
                                  {record.subject_name || "N/A"}
                                </td>
                                <td>
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                      record.status === "present"
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
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Admin/Teacher View
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
      {isSubmitted && selectedClass && selectedSection && selectedSubject && (
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
                setSelectedSubject("");
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
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setSelectedSubject("");
              }}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="input"
              disabled={!selectedSection}
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject.subject_id} value={subject.subject_id}>
                  {subject.subject_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-end gap-2 mt-4 justify-end">
          <button
            onClick={handleSaveAttendance}
            disabled={
              submitting ||
              students.length === 0 ||
              (isSubmitted && !isAdmin) ||
              !selectedSubject ||
              (userRole === "teacher" && !isWithinScheduledTime)
            }
            className="btn btn-secondary w-32 disabled:opacity-50"
            title={
              userRole === "teacher" && !isWithinScheduledTime
                ? scheduleData
                  ? `You can only mark attendance during scheduled time: ${scheduleData.start_time} - ${scheduleData.end_time}`
                  : "No schedule found for this subject today"
                : ""
            }
          >
            {submitting ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleSubmitAttendance}
            disabled={
              submitting ||
              students.length === 0 ||
              isSubmitted ||
              !selectedSubject ||
              (userRole === "teacher" && !isWithinScheduledTime)
            }
            className="btn btn-primary w-32 disabled:opacity-50"
            title={
              userRole === "teacher" && !isWithinScheduledTime
                ? scheduleData
                  ? `You can only mark attendance during scheduled time: ${scheduleData.start_time} - ${scheduleData.end_time}`
                  : "No schedule found for this subject today"
                : ""
            }
          >
            {submitting
              ? "Submitting..."
              : isSubmitted
              ? "Submitted"
              : "Submit"}
          </button>
        </div>
      </div>

      {/* Statistics */}
      {students.length > 0 && selectedSubject && (
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
                <p className="text-sm text-gray-600">Leave</p>
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
        {!selectedClass || !selectedSection || !selectedSubject ? (
          <div className="p-12 text-center text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Please select class, section, and subject to view students</p>
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
                          Leave
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
