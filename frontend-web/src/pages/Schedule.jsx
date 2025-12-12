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
  Edit,
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
        if (isAdmin && selectedTeacher) {
          const res = await teachersAPI.getSchedule(selectedTeacher);
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
        } else if (selectedTeacher) {
          // Fallback for teacher view if logic above doesn't catch it (though initial data fetch handles teacher selection)
          const res = await teachersAPI.getSchedule(selectedTeacher);
          setSchedule(res.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
        toast.error("Failed to fetch schedule");
      } finally {
        setLoading(false);
      }
    };

    if (selectedTeacher || currentUser?.role === "student") {
      fetchSchedule();
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            {isAdmin ? "Teacher Schedule Management" : "My Weekly Routine"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isAdmin
              ? "View and manage weekly schedules for teachers"
              : "View your weekly class routine"}
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
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Schedule
          </button>
        )}
      </div>

      {/* Admin Filters */}
      {isAdmin && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Teacher
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="input pl-10 w-full"
                >
                  <option value="">Select a teacher to view schedule</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.first_name} {t.last_name} ({t.employee_id})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Today's Schedule View */}
      {currentUser?.role === "student" && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Today's Schedule
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                  <div className="col-span-full p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-500">
                      No classes scheduled for today.
                    </p>
                  </div>
                );
              }

              return todaysClasses.map((period, index) => (
                <div
                  key={period.id}
                  className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${getColor(
                    index
                  )} border-gray-200`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900">
                      {period.subject_name}
                    </h3>
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                      {period.start_time.slice(0, 5)} -{" "}
                      {period.end_time.slice(0, 5)}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>
                        {period.teacher_first_name} {period.teacher_last_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>Room {period.room_number || "N/A"}</span>
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* Schedule Grid - Calendar Format */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : !selectedTeacher && isAdmin ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            No Teacher Selected
          </h3>
          <p className="text-gray-500 mt-1">
            Please select a teacher to view their schedule
          </p>
        </div>
      ) : schedule.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            No Schedule Found
          </h3>
          <p className="text-gray-500 mt-1">
            {isAdmin
              ? "This teacher has no classes scheduled yet."
              : "You have no classes scheduled yet."}
          </p>
          {isAdmin && (
            <button
              onClick={() => {
                setForm((prev) => ({ ...prev, teacher_id: selectedTeacher }));
                setShowModal(true);
              }}
              className="mt-4 text-blue-600 font-medium hover:text-blue-700"
            >
              Add first class
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="px-4 py-3 text-center font-semibold text-gray-900 border-r border-gray-200 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Body */}
          <div className="grid grid-cols-7">
            {groupedSchedule.map(({ day, periods }, dayIndex) => (
              <div
                key={day}
                className="min-h-[300px] border-r border-gray-200 last:border-r-0"
              >
                <div className="p-3 space-y-2">
                  {periods.length > 0 ? (
                    periods.map((period, index) => (
                      <div
                        key={period.id}
                        className={`p-2 rounded-lg border-l-4 ${getColor(
                          index
                        )} bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-200 border border-gray-100 cursor-pointer group`}
                      >
                        <div className="mb-1">
                          <h4 className="font-bold text-sm text-gray-900 truncate">
                            {period.subject_name}
                          </h4>
                          <p className="text-xs text-gray-600 truncate">
                            {period.class_name} - {period.section_name}
                          </p>
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">
                              {period.start_time} - {period.end_time}
                            </span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">
                              Room: {period.room_number || "N/A"}
                            </span>
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="mt-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(period);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(period.id);
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic text-center py-8">
                      No classes
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          title={editingId ? "Edit Class Schedule" : "Add Class Schedule"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Teacher Selection */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teacher
                </label>
                <select
                  name="teacher_id"
                  value={form.teacher_id}
                  onChange={handleChange}
                  required
                  className="input w-full"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <select
                  name="class_id"
                  value={form.class_id}
                  onChange={handleChange}
                  required
                  className="input w-full"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <select
                  name="section_id"
                  value={form.section_id}
                  onChange={handleChange}
                  required
                  className="input w-full"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  name="subject_id"
                  value={form.subject_id}
                  onChange={handleChange}
                  required
                  className="input w-full"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Day
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setForm({ ...form, day_of_week: day })}
                      className={`
                        px-3 py-3 rounded-lg border-2 text-sm font-medium transition-all duration-200
                        ${form.day_of_week === day
                          ? "bg-blue-600 text-white border-blue-600 shadow-md"
                          : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        }
                      `}
                    >
                      <div className="text-center">
                        <div className="text-xs mb-1 opacity-80">
                          {day.substring(0, 3)}
                        </div>
                        <div className="font-bold">{day.substring(0, 1)}</div>
                      </div>
                    </button>
                  ))}
                </div>
                {!form.day_of_week && (
                  <p className="text-xs text-gray-500 mt-2">
                    Please select a day
                  </p>
                )}
              </div>

              {/* Time & Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={form.start_time}
                  onChange={handleChange}
                  required
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  name="end_time"
                  value={form.end_time}
                  onChange={handleChange}
                  required
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Number
                </label>
                <input
                  type="text"
                  name="room_number"
                  value={form.room_number}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  name="academic_year"
                  value={form.academic_year}
                  onChange={handleChange}
                  required
                  className="input w-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
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
