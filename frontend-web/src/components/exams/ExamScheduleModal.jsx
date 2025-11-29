import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Award,
  Target,
  BookOpen,
} from "lucide-react";
import { classSubjectsAPI, subjectsAPI } from "../../lib/api";

const ExamScheduleModal = ({
  isOpen,
  onClose,
  onSubmit,
  schedule,
  examData,
}) => {
  const [formData, setFormData] = useState({
    subject_id: "",
    exam_date: "",
    start_time: "",
    end_time: "",
    room_number: "",
    max_marks: examData?.total_marks || 100,
    passing_marks: examData?.passing_marks || 40,
  });

  const [errors, setErrors] = useState({});

  // Fetch subjects for the class
  const { data: classSubjectsData } = useQuery({
    queryKey: ["class-subjects", examData?.class_id],
    queryFn: () => classSubjectsAPI.getByClass(examData?.class_id),
    enabled: isOpen && !!examData?.class_id,
  });

  // Fallback: Fetch all subjects if no class subjects found
  const { data: allSubjectsData } = useQuery({
    queryKey: ["all-subjects"],
    queryFn: () => subjectsAPI.getAll({ status: "active" }),
    enabled: isOpen && classSubjectsData?.data?.length === 0,
  });

  // Use class subjects if available, otherwise use all subjects
  const classSubjects = classSubjectsData?.data || [];
  const allSubjects = allSubjectsData?.data || [];

  const subjects =
    classSubjects.length > 0
      ? classSubjects.map((cs) => ({
          id: cs.subject_id,
          name: cs.subject_name,
          code: cs.subject_code,
        }))
      : allSubjects;

  // Populate form when editing
  useEffect(() => {
    if (schedule) {
      setFormData({
        subject_id: schedule.subject_id,
        exam_date: schedule.exam_date?.split("T")[0] || "",
        start_time: schedule.start_time || "",
        end_time: schedule.end_time || "",
        room_number: schedule.room_number || "",
        max_marks: schedule.max_marks,
        passing_marks: schedule.passing_marks,
      });
    } else if (examData) {
      setFormData((prev) => ({
        ...prev,
        max_marks: examData.total_marks || 100,
        passing_marks: examData.passing_marks || 40,
      }));
    }
  }, [schedule, examData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject_id) newErrors.subject_id = "Subject is required";
    if (!formData.exam_date) newErrors.exam_date = "Exam date is required";
    if (!formData.start_time) newErrors.start_time = "Start time is required";
    if (!formData.end_time) newErrors.end_time = "End time is required";
    if (!formData.max_marks) newErrors.max_marks = "Max marks is required";
    if (!formData.passing_marks)
      newErrors.passing_marks = "Passing marks is required";

    // Validate date range
    if (formData.exam_date && examData) {
      const examDate = new Date(formData.exam_date);
      const startDate = new Date(examData.start_date);
      const endDate = new Date(examData.end_date);

      if (examDate < startDate || examDate > endDate) {
        newErrors.exam_date = `Date must be between ${startDate.toLocaleDateString()} and ${endDate.toLocaleDateString()}`;
      }
    }

    // Validate time
    if (formData.start_time && formData.end_time) {
      if (formData.start_time >= formData.end_time) {
        newErrors.end_time = "End time must be after start time";
      }
    }

    // Validate marks
    if (formData.passing_marks && formData.max_marks) {
      if (parseInt(formData.passing_marks) > parseInt(formData.max_marks)) {
        newErrors.passing_marks = "Passing marks cannot exceed max marks";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold">
            {schedule ? "Edit Schedule" : "Add Schedule"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <BookOpen className="w-4 h-4 inline mr-2" />
              Subject *
            </label>
            <select
              name="subject_id"
              value={formData.subject_id}
              onChange={handleChange}
              className={`input w-full ${
                errors.subject_id ? "border-red-500" : ""
              }`}
              disabled={!!schedule}
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} {subject.code ? `(${subject.code})` : ""}
                </option>
              ))}
            </select>
            {errors.subject_id && (
              <p className="text-red-500 text-xs mt-1">{errors.subject_id}</p>
            )}
            {classSubjects.length === 0 && allSubjects.length > 0 && (
              <p className="text-yellow-600 text-xs mt-1">
                ⚠️ No subjects assigned to this class. Showing all subjects.
              </p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Exam Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Exam Date *
              </label>
              <input
                type="date"
                name="exam_date"
                value={formData.exam_date}
                onChange={handleChange}
                min={examData?.start_date?.split("T")[0]}
                max={examData?.end_date?.split("T")[0]}
                className={`input w-full ${
                  errors.exam_date ? "border-red-500" : ""
                }`}
              />
              {errors.exam_date && (
                <p className="text-red-500 text-xs mt-1">{errors.exam_date}</p>
              )}
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Start Time *
              </label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className={`input w-full ${
                  errors.start_time ? "border-red-500" : ""
                }`}
              />
              {errors.start_time && (
                <p className="text-red-500 text-xs mt-1">{errors.start_time}</p>
              )}
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                End Time *
              </label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className={`input w-full ${
                  errors.end_time ? "border-red-500" : ""
                }`}
              />
              {errors.end_time && (
                <p className="text-red-500 text-xs mt-1">{errors.end_time}</p>
              )}
            </div>
          </div>

          {/* Room Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Room Number
            </label>
            <input
              type="text"
              name="room_number"
              value={formData.room_number}
              onChange={handleChange}
              placeholder="e.g., Room 101, Hall A"
              className="input w-full"
            />
          </div>

          {/* Marks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Max Marks */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Award className="w-4 h-4 inline mr-2" />
                Maximum Marks *
              </label>
              <input
                type="number"
                name="max_marks"
                value={formData.max_marks}
                onChange={handleChange}
                min="1"
                className={`input w-full ${
                  errors.max_marks ? "border-red-500" : ""
                }`}
              />
              {errors.max_marks && (
                <p className="text-red-500 text-xs mt-1">{errors.max_marks}</p>
              )}
            </div>

            {/* Passing Marks */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Target className="w-4 h-4 inline mr-2" />
                Passing Marks *
              </label>
              <input
                type="number"
                name="passing_marks"
                value={formData.passing_marks}
                onChange={handleChange}
                min="1"
                max={formData.max_marks}
                className={`input w-full ${
                  errors.passing_marks ? "border-red-500" : ""
                }`}
              />
              {errors.passing_marks && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.passing_marks}
                </p>
              )}
              {formData.max_marks && formData.passing_marks && (
                <p className="text-xs text-gray-500 mt-1">
                  Pass Percentage:{" "}
                  {(
                    (formData.passing_marks / formData.max_marks) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              {schedule ? "Update Schedule" : "Add Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamScheduleModal;
