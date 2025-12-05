import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { subjectsAPI } from "../../lib/api";
import { AlertCircle } from "lucide-react";

const SubjectForm = ({ subject, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    prerequisite_type: "none",
    prerequisite_subject_ids: [], // Changed to array
    subject_nature: "compulsory",
    is_active: 1,
  });

  // Fetch all active subjects for prerequisite dropdown
  const { data: subjectsData } = useQuery({
    queryKey: ["subjects-for-prerequisite"],
    queryFn: () => subjectsAPI.getAll({ status: "active" }),
  });

  const availableSubjects = (subjectsData?.data || []).filter(
    (s) => s.id !== subject?.id // Don't let subject be its own prerequisite
  );

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name || "",
        code: subject.code || "",
        description: subject.description || "",
        prerequisite_type: subject.prerequisite_type || "none",
        prerequisite_subject_ids: subject.prerequisite_subject_ids || [], // Array
        subject_nature: subject.subject_nature || "compulsory",
        is_active: subject.is_active,
      });
    }
  }, [subject]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate prerequisite consistency
    if (
      formData.prerequisite_type === "subject_exam" &&
      (!formData.prerequisite_subject_ids ||
        formData.prerequisite_subject_ids.length === 0)
    ) {
      alert("Please select at least one prerequisite subject");
      return;
    }

    // Clean data before submitting
    const submitData = {
      ...formData,
      prerequisite_subject_ids:
        formData.prerequisite_type === "subject_exam"
          ? formData.prerequisite_subject_ids
          : [],
    };

    onSubmit(submitData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePrerequisiteTypeChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      prerequisite_type: value,
      prerequisite_subject_ids:
        value === "none" ? [] : prev.prerequisite_subject_ids,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Subject Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="input w-full"
          placeholder="e.g., Mathematics"
          required
        />
      </div>

      {/* Subject Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={(e) =>
            handleChange({
              target: {
                name: "code",
                value: e.target.value.toUpperCase(),
              },
            })
          }
          className="input w-full"
          placeholder="e.g., MATH"
          maxLength={20}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="input w-full"
          rows="3"
          placeholder="Brief description of the subject..."
        />
      </div>

      {/* Divider */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Subject Configuration
        </h3>
      </div>

      {/* Subject Nature */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subject Nature <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="subject_nature"
              value="compulsory"
              checked={formData.subject_nature === "compulsory"}
              onChange={handleChange}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <div>
              <span className="font-medium text-gray-900">Compulsory</span>
              <p className="text-xs text-gray-500">Required for all students</p>
            </div>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="subject_nature"
              value="elective"
              checked={formData.subject_nature === "elective"}
              onChange={handleChange}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <div>
              <span className="font-medium text-gray-900">
                Elective (Optional)
              </span>
              <p className="text-xs text-gray-500">
                Students can choose to take this
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Who Can Read the Subject (Prerequisites) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Who Can Read the Subject <span className="text-red-500">*</span>
        </label>
        <select
          name="prerequisite_type"
          value={formData.prerequisite_type}
          onChange={handlePrerequisiteTypeChange}
          className="input w-full mb-3"
        >
          <option value="none">Anyone Can Study the Subject</option>
          <option value="subject_exam">
            Must Pass Final Exam of Another Subject(s)
          </option>
        </select>

        {/* Conditional Multiple Prerequisite Subject Selector */}
        {formData.prerequisite_type === "subject_exam" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Prerequisite Required
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Students must pass the final exam of ALL selected subjects
                  before enrolling
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Prerequisite Subject(s){" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="max-h-48 overflow-y-auto border rounded-lg p-3 bg-white space-y-2">
                {availableSubjects.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No other subjects available
                  </p>
                ) : (
                  availableSubjects.map((subj) => (
                    <label
                      key={subj.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        value={subj.id}
                        checked={(
                          formData.prerequisite_subject_ids || []
                        ).includes(subj.id)}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          const value = parseInt(e.target.value);
                          setFormData((prev) => ({
                            ...prev,
                            prerequisite_subject_ids: isChecked
                              ? [
                                  ...(prev.prerequisite_subject_ids || []),
                                  value,
                                ]
                              : (prev.prerequisite_subject_ids || []).filter(
                                  (id) => id !== value
                                ),
                          }));
                        }}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900">
                          {subj.name}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({subj.code})
                        </span>
                      </div>
                    </label>
                  ))
                )}
              </div>
              {formData.prerequisite_subject_ids &&
                formData.prerequisite_subject_ids.length > 0 && (
                  <p className="text-xs text-gray-600 mt-2">
                    ✓ {formData.prerequisite_subject_ids.length} prerequisite(s)
                    selected
                  </p>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          name="is_active"
          value={formData.is_active}
          onChange={handleChange}
          className="input w-full"
        >
          <option value={1}>Active</option>
          <option value={0}>Inactive</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button type="button" onClick={onCancel} className="btn btn-outline">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {subject ? "Update Subject" : "Create Subject"}
        </button>
      </div>
    </form>
  );
};

export default SubjectForm;
