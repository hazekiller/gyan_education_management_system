import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Lock,
  Unlock,
  AlertCircle,
  Clock,
  CheckCircle,
  Filter,
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
import AttendanceStats from "../components/attendance/AttendanceStats";
import StudentAttendanceCalendar from "../components/attendance/StudentAttendanceCalendar";
import TeacherAttendanceTable from "../components/attendance/TeacherAttendanceTable";

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

  /* ADDED: Attendance Mode State */
  const [attendanceMode, setAttendanceMode] = useState("subject"); // 'subject' or 'class'

  const queryClient = useQueryClient();
  const currentUser = useSelector(selectCurrentUser);
  const userRole = useSelector(selectUserRole);

  // Check if user is admin
  const isAdmin = ["super_admin", "principal", "vice_principal"].includes(
    userRole
  );

  // --- TEACHER/ADMIN LOGIC ---

  // Fetch classes (role-based)
  const { data: classesData } = useQuery({
    queryKey: ["my-classes"],
    queryFn: classesAPI.getMyClasses,
    enabled: userRole !== "student",
  });

  const classes = classesData?.data || [];

  // Fetch sections when class is selected
  const { data: sectionsData } = useQuery({
    queryKey: ["my-sections", selectedClass],
    queryFn: () => classesAPI.getMySections(selectedClass),
    enabled: !!selectedClass && userRole !== "student",
  });

  const sections = sectionsData?.data || [];

  // Fetch subjects when section is selected
  const { data: subjectsData } = useQuery({
    queryKey: ["section-subjects", selectedSection],
    queryFn: () => classSubjectsAPI.getBySection(selectedSection),
    enabled: !!selectedSection && userRole !== "student",
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
      // Logic adjusted: Only fetch schedule if in Subject Mode AND subject is selected
      if (!selectedClass || !selectedSection || !selectedSubject || attendanceMode === 'class') return null;

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

      const response = await fetch(
        `${import.meta.env.VITE_API_URL
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
      userRole === "teacher" &&
      attendanceMode === 'subject',
    refetchInterval: 60000,
  });

  // Check if current time is within the scheduled class time
  const isWithinScheduledTime = useMemo(() => {
    if (isAdmin) return true;
    if (!isMarkingForToday) return false;

    // If Class Mode, we assume "Daily Attendance" which spans the whole day or doesn't have a rigid timeslot check here
    // Backend creates constraints if needed, but for frontend visual block, we can relax it or assume user knows.
    if (attendanceMode === 'class') return true;

    if (!scheduleData) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = scheduleData.start_time.split(":").map(Number);
    const [endHour, endMin] = scheduleData.end_time.split(":").map(Number);

    const scheduleStart = startHour * 60 + startMin;
    const scheduleEnd = endHour * 60 + endMin;

    return currentTime >= scheduleStart && currentTime <= scheduleEnd;
  }, [scheduleData, isMarkingForToday, isAdmin, attendanceMode]);

  // Fetch students
  const { data: studentsData } = useQuery({
    queryKey: ["students", selectedClass, selectedSection],
    queryFn: () =>
      studentsAPI.getAll({
        class_id: selectedClass,
        section_id: selectedSection,
        status: "active",
      }),
    enabled: !!selectedClass && !!selectedSection && userRole !== "student",
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
      attendanceMode // Added to key
    ],
    queryFn: () =>
      attendanceAPI.get({
        class_id: selectedClass,
        section_id: selectedSection,
        // Pass subject_id only if mode is subject
        subject_id: attendanceMode === 'subject' ? selectedSubject : undefined,
        date: selectedDate,
      }),
    enabled:
      !!selectedClass &&
      !!selectedSection &&
      (attendanceMode === 'class' || !!selectedSubject) &&
      !!selectedDate &&
      userRole !== "student",
  });

  // Check submission status
  const { data: submissionStatus } = useQuery({
    queryKey: [
      "attendance-submission",
      selectedClass,
      selectedSection,
      selectedSubject,
      selectedDate,
      attendanceMode // Added to key
    ],
    queryFn: () =>
      attendanceAPI.checkSubmission({
        class_id: selectedClass,
        section_id: selectedSection,
        subject_id: attendanceMode === 'subject' ? selectedSubject : undefined,
        date: selectedDate,
      }),
    enabled:
      !!selectedClass &&
      !!selectedSection &&
      (attendanceMode === 'class' || !!selectedSubject) &&
      !!selectedDate &&
      userRole !== "student",
  });

  useEffect(() => {
    if (submissionStatus?.data) {
      setIsSubmitted(submissionStatus.data.is_submitted || false);
      setSubmissionInfo(submissionStatus.data);
    } else {
      setIsSubmitted(false);
      setSubmissionInfo(null);
    }
  }, [submissionStatus]);

  useEffect(() => {
    if (students.length > 0) {
      const newAttendanceData = {};
      students.forEach((student) => {
        const existing = existingAttendance?.data?.find(
          (a) => a.student_id === student.id
        );
        // Changed default: if no existing record, use undefined (neutral) instead of 'present'
        newAttendanceData[student.id] = existing?.status || undefined;
      });
      setAttendanceData(newAttendanceData);
    }
  }, [students, existingAttendance]);

  const handleAttendanceChange = (studentId, status) => {
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
    // Validation Logic
    if (!selectedClass || !selectedSection) {
      toast.error("Please select class and section");
      return;
    }
    if (attendanceMode === 'subject' && !selectedSubject) {
      toast.error("Please select a subject");
      return;
    }

    if (!isWithinScheduledTime && userRole === "teacher") {
      toast.error(
        "You can only mark attendance during the scheduled class time."
      );
      return;
    }
    if (isSubmitted && !isAdmin) {
      toast.error(
        "Attendance is already submitted. Contact admin to make changes."
      );
      return;
    }

    const attendanceRecords = Object.entries(attendanceData)
      .filter(([_, status]) => status !== undefined && status !== null) // Only send marked records? Or send all?
      // User likely needs to mark ALL students or at least some. 
      // If we send undefined status, API defaults to 'present' in my previous code 
      // "record.status || 'present'". 
      // User wants form style. If they leave it blank, does it mean present? No, user said "null then who is present then click tick".
      // This allows explicitly marking present/absent.
      // If I filter out undefined, they won't be saved.
      // If I define undefined as NULL in payload, backend defaults to "present".
      // Let's send specific status. If status is undefined, maybe we shouldn't send it?
      // But we are doing a FULL replacement for the date/subject.
      // So existing records are DELETED.
      // If we don't send a student, they will have NO record.
      // This is effectively "Not Marked".
      // If the goal is allow partial marking, then filtering is fine.
      // But if goal is "Full Submission", we should perhaps validate?
      // For "Save Draft", partial is fine.
      .map(([studentId, status]) => ({
        student_id: parseInt(studentId),
        class_id: parseInt(selectedClass),
        section_id: parseInt(selectedSection),
        date: selectedDate,
        status,
        remarks: "",
      }));

    if (attendanceRecords.length === 0) {
      toast.error("Please mark attendance for at least one student");
      return;
    }

    setSubmitting(true);
    try {
      await attendanceAPI.mark({
        date: selectedDate,
        class_id: parseInt(selectedClass),
        section_id: parseInt(selectedSection),
        subject_id: attendanceMode === 'subject' ? parseInt(selectedSubject) : undefined,
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
    if (!selectedClass || !selectedSection) {
      toast.error("Please select class and section");
      return;
    }
    if (attendanceMode === 'subject' && !selectedSubject) {
      toast.error("Please select a subject");
      return;
    }

    if (isSubmitted) {
      toast.error("Attendance is already submitted");
      return;
    }

    // Validate that all students have a status marked? (Optional, but good practice for "Submit")
    // Or allow default behavior. User requested "null checks". 
    // If they submit with nulls, backend will default to "present" (per controller logic: record.status || "present").
    // This is DANGEROUS if UI shows "Empty".
    // I should ensure the controller logic matches UI expectations.
    // If UI shows "Empty", backend should default to... what?
    // If they submit, usually it implies finalizing.
    // Let's assume explicitly marked ones are sent. The rest will default to Absent or Present?
    // Current controller: `record.status || "present"`.
    // If I exclude them from array, they are not inserted.
    // If "Class Attendance" deletes OLD records, and I only send 5 out of 10 students,
    // only 5 will have attendance records. The other 5 will have "No Record".
    // This might be what "null" means visually.

    const attendanceRecords = Object.entries(attendanceData)
      .filter(([_, status]) => status !== undefined && status !== null)
      .map(([studentId, status]) => ({
        student_id: parseInt(studentId),
        class_id: parseInt(selectedClass),
        section_id: parseInt(selectedSection),
        date: selectedDate,
        status,
        remarks: "",
      }));

    if (attendanceRecords.length === 0) {
      toast.error("Please mark attendance for at least one student");
      return;
    }

    setSubmitting(true);
    try {
      // Save first
      await attendanceAPI.mark({
        date: selectedDate,
        class_id: parseInt(selectedClass),
        section_id: parseInt(selectedSection),
        subject_id: attendanceMode === 'subject' ? parseInt(selectedSubject) : undefined,
        attendance_records: attendanceRecords,
      });

      // Then submit
      await attendanceAPI.submit({
        class_id: parseInt(selectedClass),
        section_id: parseInt(selectedSection),
        subject_id: attendanceMode === 'subject' ? parseInt(selectedSubject) : undefined,
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
    if (!isAdmin) return;
    if (
      !window.confirm(
        "Are you sure you want to unlock this attendance? Teachers will be able to modify it again."
      )
    )
      return;

    setSubmitting(true);
    try {
      await attendanceAPI.unlock({
        class_id: parseInt(selectedClass),
        section_id: parseInt(selectedSection),
        subject_id: attendanceMode === 'subject' ? parseInt(selectedSubject) : undefined,
        date: selectedDate,
      });
      toast.success("Attendance unlocked");
      setIsSubmitted(false);
      refetchAttendance();
      queryClient.invalidateQueries(["attendance-submission"]);
    } catch (error) {
      toast.error(error.message || "Failed to unlock attendance");
    } finally {
      setSubmitting(false);
    }
  };

  // --- STUDENT VIEW LOGIC ---
  if (userRole === "student") {
    // ... (Student logic unchanged) ...
    const [viewMonth, setViewMonth] = useState(new Date().getMonth());
    const [viewYear, setViewYear] = useState(new Date().getFullYear());

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
    const stats = myStats?.data || {};

    return (
      <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              My Attendance
            </h1>
            <p className="text-gray-500 mt-2">
              Track your daily attendance and performance stats.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <AttendanceStats stats={stats} />

        {/* Calendar Section */}
        <StudentAttendanceCalendar
          attendanceList={attendanceList}
          viewMonth={viewMonth}
          viewYear={viewYear}
          onMonthChange={setViewMonth}
          onYearChange={setViewYear}
        />
      </div>
    );
  }

  // --- TEACHER VIEW ---
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Mark Attendance
          </h1>
          <p className="text-gray-500 mt-2">
            Select class details to view or mark attendance.
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          {isSubmitted ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200">
              <Lock className="w-4 h-4" />
              Locked
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium border border-gray-200">
              <Unlock className="w-4 h-4" />
              Open for Marking
            </div>
          )}
        </div>
      </div>

      {/* Filter / Selection Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-gray-800 font-semibold">
            <Filter className="w-5 h-5 text-indigo-600" />
            Attendance Filters
          </div>
          {/* Mode Switcher */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setAttendanceMode("subject")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${attendanceMode === "subject"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Subject Wise
            </button>
            <button
              onClick={() => {
                setAttendanceMode("class");
                setSelectedSubject(""); // Reset subject
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${attendanceMode === "class"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Class Wise
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="form-control">
            <label className="label text-xs font-semibold text-gray-500 uppercase">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-700"
            />
          </div>

          <div className="form-control">
            <label className="label text-xs font-semibold text-gray-500 uppercase">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection("");
                setSelectedSubject("");
              }}
              className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-700"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label text-xs font-semibold text-gray-500 uppercase">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setSelectedSubject("");
              }}
              disabled={!selectedClass}
              className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-700"
            >
              <option value="">Select Section</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
            </select>
          </div>

          {attendanceMode === 'subject' && (
            <div className="form-control">
              <label className="label text-xs font-semibold text-gray-500 uppercase">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={!selectedSection}
                className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-900"
              >
                <option value="">Select Subject</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {teacherViewRenderCheck({
        selectedSubject,
        attendanceMode,
        isWithinScheduledTime,
        userRole,
        isAdmin,
      }) ? (
        <>
          {/* Main Attendance Table */}
          <TeacherAttendanceTable
            students={students}
            attendanceData={attendanceData}
            onAttendanceChange={handleAttendanceChange}
            isSubmitted={isSubmitted}
            isAdmin={isAdmin}
            subjectName={subjects.find(s => s.id == selectedSubject)?.name}
          />

          {/* Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:static md:bg-transparent md:border-0 md:shadow-none md:p-0">
            <div className="max-w-7xl mx-auto flex justify-end gap-3">
              {isSubmitted && isAdmin && (
                <button
                  onClick={handleUnlockAttendance}
                  disabled={submitting}
                  className="btn bg-white hover:bg-gray-50 text-indigo-600 border-indigo-200 gap-2"
                >
                  <Unlock className="w-5 h-5" />
                  Unlock Attendance
                </button>
              )}

              {!isSubmitted ? (
                <>
                  <button
                    onClick={handleSaveAttendance}
                    disabled={submitting}
                    className="btn btn-outline gap-2"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={handleSubmitAttendance}
                    disabled={submitting}
                    className="btn bg-indigo-600 hover:bg-indigo-700 text-white gap-2 border-0"
                  >
                    {submitting && <span className="loading loading-spinner" />}
                    Submit & Lock
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 text-emerald-600 font-medium px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
                  <CheckCircle className="w-5 h-5" />
                  Attendance Submitted on{" "}
                  {new Date(submissionInfo?.submitted_at).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        renderEmptyState({
          selectedClass,
          selectedSection,
          selectedSubject,
          attendanceMode,
          isWithinScheduledTime,
          userRole,
          isAdmin,
        })
      )}
    </div>
  );
}; // End of Component

// --- Helper Components for Clean Code ---

function teacherViewRenderCheck({
  selectedSubject,
  attendanceMode,
  isWithinScheduledTime,
  userRole,
  isAdmin,
}) {
  if (attendanceMode === 'subject' && !selectedSubject) return false;
  // If Class Mode, no subject needed
  if (!isWithinScheduledTime && userRole === "teacher" && !isAdmin) return false;

  return true;
}

function renderEmptyState({
  selectedClass,
  selectedSection,
  selectedSubject,
  attendanceMode,
  isWithinScheduledTime,
  userRole,
  isAdmin,
}) {
  if (!selectedClass || !selectedSection || (attendanceMode === 'subject' && !selectedSubject)) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600">
          Select filters to view attendance
        </h3>
        <p className="text-gray-400 max-w-sm mx-auto mt-2">
          Please select a class, section, {attendanceMode === 'subject' && 'and subject'} from the filters above.
        </p>
      </div>
    );
  }

  if (!isWithinScheduledTime && userRole === "teacher" && !isAdmin) {
    return (
      <div className="text-center py-20 bg-orange-50 rounded-2xl border border-orange-100">
        <Clock className="w-12 h-12 text-orange-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-orange-700">
          Outside Scheduled Time
        </h3>
        <p className="text-orange-600 max-w-md mx-auto mt-2">
          You can only mark attendance during the scheduled class time.
        </p>
      </div>
    );
  }

  return null;
}

export default Attendance;
