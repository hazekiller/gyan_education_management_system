import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  BookText,
  User,
  Save,
  X,
} from "lucide-react";
import { classesAPI, subjectsAPI } from "../../lib/api";
import toast from "react-hot-toast";
import Modal from "../common/Modal";
import {usePermission} from "../../hooks/usePermission";
import { PERMISSIONS } from "../../utils/rbac";


const ClassSubjectsManager = ({ classId, classData, teachers, subjects, onClose }) => {
  const queryClient = useQueryClient();
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editTeacherId, setEditTeacherId] = useState(null);
  
  // NEW: State for create subject modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: "",
    code: "",
    description: "",
  });

  // Fetch class subjects
  const { data: classSubjectsData, isLoading } = useQuery({
    queryKey: ["class-subjects", classId],
    queryFn: () => classesAPI.getClassSubjects(classId),
    enabled: !!classId,
  });

  // Fetch available subjects
  const { data: availableSubjectsData } = useQuery({
    queryKey: ["available-subjects", classId],
    queryFn: () => classesAPI.getAvailableSubjects(classId),
    enabled: !!classId,
  });

  const classSubjects = classSubjectsData?.data || [];
  const availableSubjects = availableSubjectsData?.data || [];

  // Assign single subject mutation
  const assignSubjectMutation = useMutation({
    mutationFn: (data) => classesAPI.assignSubjectToClass(data),
    onSuccess: () => {
      toast.success("Subject assigned successfully");
      queryClient.invalidateQueries(["class-subjects", classId]);
      queryClient.invalidateQueries(["available-subjects", classId]);
      setSelectedSubjects([]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to assign subject");
    },
  });

  // Bulk assign subjects mutation
  const bulkAssignMutation = useMutation({
    mutationFn: (data) => classesAPI.assignMultipleSubjects(data),
    onSuccess: () => {
      toast.success("Subjects assigned successfully");
      queryClient.invalidateQueries(["class-subjects", classId]);
      queryClient.invalidateQueries(["available-subjects", classId]);
      setSelectedSubjects([]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to assign subjects");
    },
  });

  // Update subject mutation
  const updateSubjectMutation = useMutation({
    mutationFn: ({ assignmentId, data }) =>
      classesAPI.updateClassSubject(assignmentId, data),
    onSuccess: () => {
      toast.success("Subject updated successfully");
      queryClient.invalidateQueries(["class-subjects", classId]);
      setEditingSubject(null);
      setEditTeacherId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update subject");
    },
  });

  // Remove subject mutation
  const removeSubjectMutation = useMutation({
    mutationFn: (assignmentId) => classesAPI.removeSubjectFromClass(assignmentId),
    onSuccess: () => {
      toast.success("Subject removed successfully");
      queryClient.invalidateQueries(["class-subjects", classId]);
      queryClient.invalidateQueries(["available-subjects", classId]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove subject");
    },
  });

  // NEW: Create subject mutation
  const createSubjectMutation = useMutation({
    mutationFn: (data) => subjectsAPI.create(data),
    onSuccess: () => {
      toast.success("Subject created successfully");
      queryClient.invalidateQueries(["subjects"]);
      queryClient.invalidateQueries(["available-subjects", classId]);
      setShowCreateModal(false);
      setNewSubject({ name: "", code: "", description: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create subject");
    },
  });

  const handleBulkAssign = () => {
    if (selectedSubjects.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }

    const subjectsToAssign = selectedSubjects.map((subjectId) => ({
      subject_id: subjectId,
      teacher_id: null,
    }));

    bulkAssignMutation.mutate({
      class_id: classId,
      subjects: subjectsToAssign,
      academic_year: classData.academic_year,
    });
  };

  const handleToggleSubject = (subjectId) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject.assignment_id);
    setEditTeacherId(subject.teacher_id);
  };

  const handleSaveEdit = (assignmentId) => {
    updateSubjectMutation.mutate({
      assignmentId,
      data: { teacher_id: editTeacherId },
    });
  };

  const handleCancelEdit = () => {
    setEditingSubject(null);
    setEditTeacherId(null);
  };

  const handleRemoveSubject = (assignmentId, subjectName) => {
    if (window.confirm(`Are you sure you want to remove "${subjectName}"?`)) {
      removeSubjectMutation.mutate(assignmentId);
    }
  };

  // NEW: Handle create subject
  const handleCreateSubject = (e) => {
    e.preventDefault();
    
    if (!newSubject.name || !newSubject.code) {
      toast.error("Name and code are required");
      return;
    }

    createSubjectMutation.mutate(newSubject);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subjects */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Current Subjects ({classSubjects.length})
        </h3>
        
        {classSubjects.length > 0 ? (
          <div className="space-y-3">
            {classSubjects.map((subject) => (
              <div
                key={subject.assignment_id}
                className="bg-gray-50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <BookText className="w-5 h-5 text-blue-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">
                        {subject.subject_name}
                      </h4>
                      <span className="text-xs text-gray-500">
                        ({subject.subject_code})
                      </span>
                      {subject.is_active === 1 ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                    </div>

                    {editingSubject === subject.assignment_id ? (
                      <select
                        value={editTeacherId || ""}
                        onChange={(e) =>
                          setEditTeacherId(e.target.value || null)
                        }
                        className="mt-2 input input-sm w-64"
                      >
                        <option value="">Select teacher (optional)</option>
                        {teachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.first_name} {teacher.last_name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center space-x-2 mt-1">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {subject.teacher_first_name
                            ? `${subject.teacher_first_name} ${subject.teacher_last_name}`
                            : "No teacher assigned"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-500">
                    {subject.academic_year}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {editingSubject === subject.assignment_id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(subject.assignment_id)}
                        className="btn btn-sm btn-success"
                        disabled={updateSubjectMutation.isLoading}
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="btn btn-sm btn-outline"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditSubject(subject)}
                        className="btn btn-sm btn-outline"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleRemoveSubject(
                            subject.assignment_id,
                            subject.subject_name
                          )
                        }
                        className="btn btn-sm btn-danger"
                        disabled={removeSubjectMutation.isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <BookText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No subjects assigned yet</p>
          </div>
        )}
      </div>

      {/* Available Subjects */}
      {availableSubjects.length > 0 && (
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Available Subjects ({availableSubjects.length})
            </h3>
            <div className="flex items-center space-x-2">
              {/* NEW: Create Subject Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-outline flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Subject</span>
              </button>
              
              {selectedSubjects.length > 0 && (
                <button
                  onClick={handleBulkAssign}
                  className="btn btn-primary flex items-center space-x-2"
                  disabled={bulkAssignMutation.isLoading}
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    Assign Selected ({selectedSubjects.length})
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableSubjects.map((subject) => (
              <div
                key={subject.id}
                onClick={() => handleToggleSubject(subject.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedSubjects.includes(subject.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject.id)}
                      onChange={() => handleToggleSubject(subject.id)}
                      className="w-4 h-4 text-blue-600 rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {subject.name}
                      </h4>
                      <p className="text-sm text-gray-500">{subject.code}</p>
                    </div>
                  </div>
                  {selectedSubjects.includes(subject.id) && (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show "No available subjects" message */}
      {availableSubjects.length === 0 && classSubjects.length > 0 && (
        <div className="border-t pt-6">
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <BookText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 mb-3">No more subjects available to assign</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-outline flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Subject</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-gray-600">
          <p>
            <strong>Note:</strong> Subjects assigned here will be available to
            all sections of this class.
          </p>
          <p className="text-xs mt-1">
            You can override teachers for specific sections in the "Sections"
            tab.
          </p>
        </div>
        <button onClick={onClose} className="btn btn-outline">
          Close
        </button>
      </div>
    
      {/* NEW: Create Subject Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewSubject({ name: "", code: "", description: "" });
        }}
        title="Create New Subject"
        size="md"
      >
        <form onSubmit={handleCreateSubject} className="space-y-4">
          {/* Subject Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newSubject.name}
              onChange={(e) =>
                setNewSubject({ ...newSubject, name: e.target.value })
              }
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
              value={newSubject.code}
              onChange={(e) =>
                setNewSubject({
                  ...newSubject,
                  code: e.target.value.toUpperCase(),
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
              Description (Optional)
            </label>
            <textarea
              value={newSubject.description}
              onChange={(e) =>
                setNewSubject({ ...newSubject, description: e.target.value })
              }
              className="input w-full"
              rows="3"
              placeholder="Brief description of the subject..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setNewSubject({ name: "", code: "", description: "" });
              }}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createSubjectMutation.isLoading}
            >
              {createSubjectMutation.isLoading ? "Creating..." : "Create Subject"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClassSubjectsManager;