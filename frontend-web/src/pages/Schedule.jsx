import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { teachersAPI, classesAPI, subjectsAPI, timetableAPI } from "../lib/api";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../store/slices/authSlice";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  User,
  Loader,
  Trash2,
} from "lucide-react";
import Modal from "../components/common/Modal";
import toast from "react-hot-toast";

const subjectColors = [
  "border-red-400",
  "border-blue-400",
  "border-green-400",
  "border-yellow-400",
  "border-purple-400",
  "border-pink-400",
];

const getColor = (index) => subjectColors[index % subjectColors.length];

const Schedule = () => {
  const currentUser = useSelector(selectCurrentUser);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin specific state
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    teacher_id: "",
    class_id: "",
    section_id: "",
    subject_id: "",
    day_of_week: "",
    start_time: "",
    end_time: "",
    room_number: "",
    academic_year: new Date().getFullYear().toString(),
  });

  const isAdmin = [
    "super_admin",
    "principal",
    "vice_principal",
    "hod",
  ].includes(currentUser?.role);
  const isTeacher = currentUser?.role === "teacher";

  // Initial Data Fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        if (isAdmin) {
          const [tRes, cRes, sRes] = await Promise.all([
            teachersAPI.getAll(),
            classesAPI.getAll(),
            subjectsAPI.getAll(),
          ]);
          setTeachers(tRes.data || []);
          setClasses(cRes.data || []);
          setSubjects(sRes.data || []);
          setLoading(false);
        } else if (isTeacher) {
          // Fetch teacher record using user_id to get teacher ID
          try {
            const teachersRes = await teachersAPI.getAll();
            const teacherRecord = teachersRes.data?.find(
              (t) => t.user_id === currentUser.id
            );

            if (teacherRecord) {
              setSelectedTeacher(teacherRecord.id);
            } else {
              console.error(
                "Teacher record not found for user:",
                currentUser.id
              );
              toast.error("Teacher profile not found");
              setLoading(false);
            }
          } catch (error) {
            console.error("Failed to fetch teacher record:", error);
            toast.error("Failed to load teacher profile");
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        toast.error("Failed to load data");
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchInitialData();
    }
  }, [currentUser, isAdmin, isTeacher]);

  // Fetch schedule
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        // Validate selectedTeacher is a valid non-empty value
        const validTeacherId = selectedTeacher && selectedTeacher !== "" ? selectedTeacher : null;

        if (isAdmin && validTeacherId) {
          const res = await teachersAPI.getSchedule(validTeacherId);
          setSchedule(res.data || []);
        } else if (currentUser?.role === "student") {
          // Fetch student's schedule for today/week
          // For now, let's fetch the whole week for the student's class/section
          const res = await timetableAPI.get({
            class_id: currentUser.class_id,
            section_id: currentUser.section_id,
            academic_year: new Date().getFullYear().toString(), // Optional: infer from current year
          });
          setSchedule(res.data || []);
        } else if (validTeacherId) {
          // Fallback for teacher view if logic above doesn't catch it (though initial data fetch handles teacher selection)
          const res = await teachersAPI.getSchedule(validTeacherId);
          setSchedule(res.data || []);
        } else {
          // No valid teacher selected and not a student, clear schedule
          setSchedule([]);
        }
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
        toast.error("Failed to fetch schedule");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have a valid teacher ID or user is a student
    const validTeacherId = selectedTeacher && selectedTeacher !== "" ? selectedTeacher : null;
    if (validTeacherId || currentUser?.role === "student") {
      fetchSchedule();
    } else if (isAdmin) {
      // Admin with no teacher selected, just stop loading
      setLoading(false);
      setSchedule([]);
    }
  }, [selectedTeacher, currentUser, isAdmin]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule entry?"))
      return;
    try {
      await timetableAPI.delete(id);
      toast.success("Schedule entry deleted");
      // Refresh
      if (selectedTeacher) {
        const res = await teachersAPI.getSchedule(selectedTeacher);
        setSchedule(res.data || []);
      }
    } catch (error) {
      toast.error("Failed to delete schedule entry");
    }
  };

  const handleEdit = (period) => {
    setEditingId(period.id);
    // Capitalize first letter of day to match UI options
    const day =
      period.day_of_week.charAt(0).toUpperCase() + period.day_of_week.slice(1);

    setForm({
      teacher_id: period.teacher_id,
      class_id: period.class_id,
      section_id: period.section_id,
      subject_id: period.subject_id,
      day_of_week: day,
      start_time: period.start_time,
      end_time: period.end_time,
      room_number: period.room_number || "",
      academic_year: period.academic_year,
    });
    setShowModal(true);
  };

  // Fetch sections when class changes (for form)
  useEffect(() => {
    if (form.class_id) {
      const fetchSections = async () => {
        try {
          const res = await classesAPI.getSections(form.class_id);
          setSections(res.data || []);
        } catch (error) {
          console.error("Failed to fetch sections:", error);
        }
      };
      fetchSections();
    } else {
      setSections([]);
    }
  }, [form.class_id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Convert day_of_week to lowercase to match database ENUM
      const scheduleData = {
        ...form,
        day_of_week: form.day_of_week.toLowerCase(),
      };

      if (editingId) {
        await timetableAPI.update(editingId, scheduleData);
        toast.success("Schedule updated successfully!");
      } else {
        await teachersAPI.assignSchedule(scheduleData);
        toast.success("Schedule created successfully!");
      }

      setShowModal(false);
      setEditingId(null);

      // Refresh schedule if the assigned teacher is currently selected
      if (selectedTeacher == form.teacher_id) {
        const res = await teachersAPI.getSchedule(selectedTeacher);
        setSchedule(res.data || []);
      }
      // Reset form
      setForm((prev) => ({
        ...prev,
        class_id: "",
        section_id: "",
        subject_id: "",
        day_of_week: "",
        start_time: "",
        end_time: "",
        room_number: "",
      }));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save schedule");
    } finally {
      setSubmitting(false);
    }
  };

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const groupedSchedule = daysOfWeek.map((day) => ({
    day,
    periods: schedule
      .filter((p) => p.day_of_week?.toLowerCase() === day.toLowerCase())
      .sort((a, b) => {
        // Sort by start time
        return a.start_time.localeCompare(b.start_time);
      }),
  }));

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              {isAdmin ? "Schedule Management" : "My Weekly Routine"}
            </h1>
            <p className="text-gray-500 mt-1 ml-12">
              {isAdmin
                ? "Organize and manage weekly class schedules for teachers"
                : "View your upcoming classes and weekly timetable"}
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                setForm((prev) => ({
                  ...prev,
                  teacher_id: selectedTeacher || "",
                }));
                setShowModal(true);
              }}
              className="btn bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-200 flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Add Class</span>
            </button>
          )}
        </div>

        {/* Admin Filters - Teacher Selection */}
        {isAdmin && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 w-full max-w-lg">
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                  Select Teacher
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                  <select
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer hover:bg-gray-100/50"
                  >
                    <option value="">Select a teacher to view schedule...</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.first_name} {t.last_name} ({t.employee_id})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="hidden md:block h-12 w-px bg-gray-200 mx-4"></div>
              <div className="text-sm text-gray-500 flex-1">
                <p>Select a teacher from the dropdown to view, edit, or manage their weekly class schedule.</p>
              </div>
            </div>
          </div>
        )}

        {/* Student Today's Schedule View */}
        {currentUser?.role === "student" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                Today's Classes
              </h2>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {(() => {
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
                const todaysClasses = schedule
                  .filter((p) => p.day_of_week === today)
                  .sort((a, b) => a.start_time.localeCompare(b.start_time));

                if (todaysClasses.length === 0) {
                  return (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="w-8 h-8 text-gray-300" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">No classes today</h3>
                      <p className="text-gray-500 mt-1">Enjoy your free time!</p>
                    </div>
                  );
                }

                return todaysClasses.map((period, index) => (
                  <div
                    key={period.id}
                    className="group bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getColor(index).replace('border-', 'bg-')}`}></div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">
                        {period.subject_name}
                      </h3>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">
                          {period.start_time.slice(0, 5)} - {period.end_time.slice(0, 5)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm pt-1 border-t border-gray-50">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="truncate max-w-[100px]" title={`${period.teacher_first_name} ${period.teacher_last_name}`}>
                            {period.teacher_first_name} {period.teacher_last_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>Rm {period.room_number || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* Schedule Grid - Weekly Calendar Format */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Loader className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading schedule...</p>
          </div>
        ) : !selectedTeacher && isAdmin ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 px-4 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <User className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Teacher Selected
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">
              Please select a teacher from the dropdown above to view and manage their class schedule.
            </p>
          </div>
        ) : schedule.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 px-4 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Schedule Found
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              {isAdmin
                ? "This teacher has no classes scheduled yet. Start by adding a new class to their routine."
                : "You have no classes scheduled yet."}
            </p>
            {isAdmin && (
              <button
                onClick={() => {
                  setForm((prev) => ({ ...prev, teacher_id: selectedTeacher }));
                  setShowModal(true);
                }}
                className="btn btn-outline border-blue-600 text-blue-600 hover:bg-blue-50 px-6"
              >
                Create First Class
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200 divide-x divide-gray-200">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="px-2 py-4 text-center"
                >
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {day.substring(0, 3)}
                  </span>
                  <span className="block text-sm font-bold text-gray-900 hidden md:block">
                    {day}
                  </span>
                </div>
              ))}
            </div>

            {/* Calendar Body */}
            <div className="grid grid-cols-7 divide-x divide-gray-200 bg-gray-50/30">
              {groupedSchedule.map(({ day, periods }, dayIndex) => (
                <div
                  key={day}
                  className="min-h-[400px] relative group/col transition-colors hover:bg-white"
                >
                  <div className="p-2 space-y-3 h-full">
                    {periods.length > 0 ? (
                      periods.map((period, index) => (
                        <div
                          key={period.id}
                          onClick={() => isAdmin && handleEdit(period)}
                          className={`
                            relative p-3 rounded-xl border transition-all duration-200 cursor-pointer text-left
                            ${getColor(index).replace('border-', 'bg-').replace('400', '50')} 
                            ${getColor(index).replace('border-', 'border-').replace('400', '200')}
                            hover:shadow-md hover:-translate-y-0.5 group/card
                          `}
                        >
                          <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${getColor(index).replace('border-', 'bg-').replace('400', '500')}`}></div>

                          <div className="pl-2">
                            <h4 className="font-bold text-sm text-gray-900 leading-tight mb-1">
                              {period.subject_name}
                            </h4>
                            <p className="text-xs font-medium text-gray-600 mb-2 truncate">
                              {period.class_name} • {period.section_name}
                            </p>

                            <div className="space-y-1 border-t border-gray-200/50 pt-2 mt-2">
                              <div className="flex items-center text-xs text-gray-500 font-medium bg-white/60 p-1 rounded">
                                <Clock className="w-3 h-3 mr-1.5 flex-shrink-0 text-blue-500" />
                                <span className="truncate tracking-tight">
                                  {period.start_time.slice(0, 5)} - {period.end_time.slice(0, 5)}
                                </span>
                              </div>
                              <div className="flex items-center text-xs text-gray-500 bg-white/60 p-1 rounded">
                                <MapPin className="w-3 h-3 mr-1.5 flex-shrink-0 text-red-400" />
                                <span className="truncate">
                                  Rm {period.room_number || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {isAdmin && (
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity bg-white/90 rounded-lg p-0.5 shadow-sm backdrop-blur-sm">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(period.id);
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                title="Delete Class"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-0 group-hover/col:opacity-100 transition-opacity">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mb-2"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Schedule Modal (Admin Only) */}
      {isAdmin && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingId(null);
            setForm({
              teacher_id: "",
              class_id: "",
              section_id: "",
              subject_id: "",
              day_of_week: "",
              start_time: "",
              end_time: "",
              room_number: "",
              academic_year: new Date().getFullYear().toString(),
            });
          }}
          title={editingId ? "Edit Class Schedule" : "Add New Class"}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
              <h4 className="text-sm font-bold text-blue-800 mb-1">Schedule Details</h4>
              <p className="text-xs text-blue-600">Configure the class timing and details below.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Teacher Selection */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assign Teacher
                </label>
                <select
                  name="teacher_id"
                  value={form.teacher_id}
                  onChange={handleChange}
                  required
                  className="input w-full bg-gray-50 focus:bg-white transition-colors py-2.5"
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.first_name} {t.last_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class & Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Class
                </label>
                <select
                  name="class_id"
                  value={form.class_id}
                  onChange={handleChange}
                  required
                  className="input w-full bg-gray-50 focus:bg-white transition-colors py-2.5"
                >
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Section
                </label>
                <select
                  name="section_id"
                  value={form.section_id}
                  onChange={handleChange}
                  required
                  className="input w-full bg-gray-50 focus:bg-white transition-colors py-2.5"
                  disabled={!form.class_id}
                >
                  <option value="">Select Section</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  name="subject_id"
                  value={form.subject_id}
                  onChange={handleChange}
                  required
                  className="input w-full bg-gray-50 focus:bg-white transition-colors py-2.5"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Calendar-style Day Selection */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Day
                </label>
                <div className="flex justify-between gap-2 overflow-x-auto pb-2">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setForm({ ...form, day_of_week: day })}
                      className={`
                        flex-1 min-w-[3rem] px-2 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200
                        ${form.day_of_week === day
                          ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-105"
                          : "bg-white text-gray-600 border-gray-100 hover:border-blue-300 hover:bg-blue-50"
                        }
                      `}
                    >
                      <div className="text-center">
                        <div className={`text-[10px] uppercase tracking-wider mb-0.5 ${form.day_of_week === day ? "opacity-80" : "text-gray-400"}`}>
                          {day.substring(0, 3)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {!form.day_of_week && (
                  <p className="text-xs text-red-500 mt-1 pl-1">
                    * Please select a day for the class
                  </p>
                )}
              </div>

              {/* Time & Period */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={form.start_time}
                  onChange={handleChange}
                  required
                  className="input w-full bg-gray-50 focus:bg-white py-2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  name="end_time"
                  value={form.end_time}
                  onChange={handleChange}
                  required
                  className="input w-full bg-gray-50 focus:bg-white py-2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Room Number
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="room_number"
                    value={form.room_number}
                    onChange={handleChange}
                    className="input w-full pl-9 bg-gray-50 focus:bg-white py-2.5"
                    placeholder="e.g. 101"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Academic Year
                </label>
                <input
                  type="text"
                  name="academic_year"
                  value={form.academic_year}
                  onChange={handleChange}
                  required
                  className="input w-full bg-gray-50 focus:bg-white py-2.5"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 flex items-center"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Schedule"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Schedule;
