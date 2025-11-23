import { useState } from "react";
import { Plus, X } from "lucide-react";
import toast from "react-hot-toast";

const ClassForm = ({
  classItem = null,
  onSubmit,
  onCancel,
  isSubmitting,
  teachers = [],
}) => {
  const [formData, setFormData] = useState({
    name: classItem?.name || "",
    grade_level: classItem?.grade_level || "",
    class_teacher_id: classItem?.class_teacher_id || "",
    academic_year:
      classItem?.academic_year || new Date().getFullYear().toString(),
    room_number: classItem?.room_number || "",
    capacity: classItem?.capacity || "40",
    description: classItem?.description || "",
    status: classItem?.status || "active",
  });

  // Section management state (only for creating new classes)
  const [sections, setSections] = useState([]);
  const [newSectionName, setNewSectionName] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddSection = () => {
    if (!newSectionName.trim()) {
      toast.error("Please enter a section name");
      return;
    }

    if (sections.includes(newSectionName.trim().toUpperCase())) {
      toast.error("This section already exists");
      return;
    }

    setSections([...sections, newSectionName.trim().toUpperCase()]);
    setNewSectionName("");
  };

  const handleRemoveSection = (sectionToRemove) => {
    setSections(sections.filter((section) => section !== sectionToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.grade_level || !formData.academic_year) {
      toast.error("Please fill all required fields");
      return;
    }

    // Prepare data - convert empty strings to null
    const submitData = {
      ...formData,
      class_teacher_id: formData.class_teacher_id || null,
      room_number: formData.room_number || null,
      capacity: formData.capacity ? parseInt(formData.capacity) : 40,
      description: formData.description || null,
    };

    // Only include sections when creating a new class
    if (!classItem && sections.length > 0) {
      submitData.sections = sections;
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">
          Class Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              placeholder="e.g., Class 10 or Grade 10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade Level *
            </label>
            <input
              type="number"
              name="grade_level"
              value={formData.grade_level}
              onChange={handleChange}
              className="input"
              placeholder="e.g., 10"
              min="1"
              max="12"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Year *
            </label>
            <input
              type="text"
              name="academic_year"
              value={formData.academic_year}
              onChange={handleChange}
              className="input"
              placeholder="e.g., 2024-2025"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Teacher
            </label>
            <select
              name="class_teacher_id"
              value={formData.class_teacher_id}
              onChange={handleChange}
              className="input"
            >
              <option value="">Select Teacher (Optional)</option>
              {teachers
                .filter((teacher) => teacher.status === "active")
                .map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.first_name} {teacher.last_name} (
                    {teacher.employee_id})
                  </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Assign a primary teacher for this class
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Number
            </label>
            <input
              type="text"
              name="room_number"
              value={formData.room_number}
              onChange={handleChange}
              className="input"
              placeholder="e.g., Room 101 or A-Block 201"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacity
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              className="input"
              placeholder="e.g., 40"
              min="1"
              max="100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum number of students
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input"
            rows="3"
            placeholder="Optional description about the class (e.g., science stream, commerce stream, etc.)"
          />
        </div>
      </div>

      {/* Sections - Only show when creating new class */}
      {!classItem && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            Class Sections (Optional)
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Add sections for this class (e.g., A, B, C). You can also add
            sections later.
          </p>

          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value.toUpperCase())}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSection();
                }
              }}
              className="input flex-1"
              placeholder="e.g., A, B, C"
              maxLength="2"
            />
            <button
              type="button"
              onClick={handleAddSection}
              className="btn btn-primary flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          {sections.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {sections.map((section) => (
                <div
                  key={section}
                  className="bg-purple-100 text-purple-800 px-3 py-2 rounded-full flex items-center space-x-2"
                >
                  <span className="font-medium">Section {section}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSection(section)}
                    className="text-purple-600 hover:text-purple-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
            ? "Saving..."
            : classItem
            ? "Update Class"
            : "Add Class"}
        </button>
      </div>
    </form>
  );
};

export default ClassForm;
