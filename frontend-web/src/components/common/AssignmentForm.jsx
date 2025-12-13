import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { classesAPI, teachersAPI, classSubjectsAPI } from "../../lib/api";
import { selectUserRole } from "../../store/slices/authSlice";
import toast from "react-hot-toast";

const AssignmentForm = ({
  assignment = null,
  initialValues = null,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  // Get user role from Redux store
  const userRole = useSelector(selectUserRole);

  const [formData, setFormData] = useState({
    title: assignment?.title || "",
    description: assignment?.description || "",
    class_id: assignment?.class_id || initialValues?.class_id || "",
    section_id: assignment?.section_id
      ? [assignment.section_id]
      : initialValues?.section_id
        ? [initialValues.section_id]
        : [],
    subject_id: assignment?.subject_id || initialValues?.subject_id || "",
    due_date: assignment?.due_date?.split("T")[0] || "",
    total_marks: assignment?.total_marks || "",
    teacher_id: assignment?.teacher_id || "", // For admin to select teacher
    attachments: null,
  });

  // Fetch classes - role-based
  const { data: classesData } = useQuery({
    queryKey: ["classes", userRole],
    queryFn: () => {
      // For teachers: use getMyClasses to show only assigned classes
      if (userRole === "teacher") {
        return classesAPI.getMyClasses();
      }
      // For admin: show all classes
      return classesAPI.getAll();
    },
  });

  // Fetch sections based on selected class
  const { data: sectionsData } = useQuery({
    queryKey: ["sections", formData.class_id],
    queryFn: () => classesAPI.getSections(formData.class_id),
    enabled: !!formData.class_id,
  });

  // Fetch subjects based on selected class (from class_subjects table)
  const { data: subjectsData } = useQuery({
    queryKey: ["class-subjects", formData.class_id],
    queryFn: () => classSubjectsAPI.getByClass(formData.class_id),
    enabled: !!formData.class_id,
  });

  // Fetch teachers (only for admin or super_admin)
  const { data: teachersData } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => teachersAPI.getAll(),
    enabled: userRole === "admin" || userRole === "super_admin",
  });

  const classes = classesData?.data || [];
  const sections = sectionsData?.data || [];
  const classSubjects = subjectsData?.data || [];
  const teachers = teachersData?.data || [];

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // Reset section and subject when class changes
    if (name === "class_id") {
      setFormData({
        ...formData,
        class_id: value,
        section_id: [],
        subject_id: "",
      });
    } else if (name === "attachments") {
      // Handle file input
      setFormData({
        ...formData,
        [name]: files,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.title ||
      !formData.class_id ||
      !formData.section_id ||
      (Array.isArray(formData.section_id) &&
        formData.section_id.length === 0) ||
      !formData.due_date
    ) {
      toast.error(
        "Please fill all required fields and select at least one section"
      );
      return;
    }

    // For admin, check if teacher is selected
    if (
      (userRole === "admin" || userRole === "super_admin") &&
      !formData.teacher_id
    ) {
      toast.error("Please select a teacher");
      return;
    }

    // Create a clean data object - only include non-empty values
    const submitData = {
      title: formData.title,
      description: formData.description || "",
      class_id: formData.class_id,
      section_id: formData.section_id,
      due_date: formData.due_date,
    };

    // Add optional fields only if they have values
    if (formData.subject_id) submitData.subject_id = formData.subject_id;
    if (formData.total_marks) submitData.total_marks = formData.total_marks;
    if (
      formData.teacher_id &&
      (userRole === "admin" || userRole === "super_admin")
    )
      submitData.teacher_id = formData.teacher_id;
    if (formData.attachments) submitData.attachments = formData.attachments;

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Teacher Selection - Only for Admin */}
        {(userRole === "admin" || userRole === "super_admin") && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Teacher *
            </label>
            <select
              name="teacher_id"
              value={formData.teacher_id}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Select Teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.first_name} {teacher.last_name} - {teacher.email}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              The assignment will be created on behalf of this teacher
            </p>
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assignment Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input"
            placeholder="e.g., Mathematics Chapter 5 - Homework"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input"
            rows="4"
            placeholder="Enter assignment instructions and details..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Class *
          </label>
          <select
            name="class_id"
            value={formData.class_id}
            onChange={handleChange}
            className="input"
            required
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
            Section(s) *
          </label>
          {!formData.class_id ? (
            <p className="text-sm text-gray-500 italic">
              Please select a class first
            </p>
          ) : sections.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              No sections available for this class
            </p>
          ) : (
            <div className="space-y-2 border rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto">
              <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                <input
                  type="checkbox"
                  checked={
                    Array.isArray(formData.section_id) &&
                    formData.section_id.length === sections.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        section_id: sections.map((s) => s.id),
                      });
                    } else {
                      setFormData({ ...formData, section_id: [] });
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="font-medium text-gray-700">Select All</span>
              </label>
              <hr className="my-2" />
              {sections.map((section) => (
                <label
                  key={section.id}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={
                      Array.isArray(formData.section_id)
                        ? formData.section_id.includes(section.id)
                        : formData.section_id === section.id
                    }
                    onChange={(e) => {
                      const currentSections = Array.isArray(formData.section_id)
                        ? formData.section_id
                        : formData.section_id
                          ? [formData.section_id]
                          : [];

                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          section_id: [...currentSections, section.id],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          section_id: currentSections.filter(
                            (id) => id !== section.id
                          ),
                        });
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{section.name}</span>
                </label>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Select one or more sections to assign this assignment
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <select
            name="subject_id"
            value={formData.subject_id}
            onChange={handleChange}
            className="input"
            disabled={!formData.class_id}
          >
            <option value="">
              {formData.class_id
                ? "Select Subject (Optional)"
                : "Select Class First"}
            </option>
            {classSubjects.map((cs) => (
              <option key={cs.subject_id} value={cs.subject_id}>
                {cs.subject_name} ({cs.subject_code})
              </option>
            ))}
          </select>
          {!formData.class_id && (
            <p className="text-xs text-gray-500 mt-1">
              Please select a class to see available subjects
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due Date *
          </label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className="input"
            min={new Date().toISOString().split("T")[0]}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Marks
          </label>
          <input
            type="number"
            name="total_marks"
            value={formData.total_marks}
            onChange={handleChange}
            className="input"
            min="1"
            placeholder="Default: 100"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attachments
          </label>
          <input
            type="file"
            name="attachments"
            onChange={handleChange}
            className="input"
            multiple
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Accepted formats: PDF, DOC, DOCX, PNG, JPG (Max 5 files)
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Creating..."
            : assignment
              ? "Update Assignment"
              : "Create Assignment"}
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm;
