import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X, UserCheck, BookOpen, Trash2, Edit } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../common/Modal";
import { classesAPI } from "../../lib/api";

const SectionTeachersManager = ({
  sectionId,
  classData,
  teachers = [],
  subjects = [],
}) => {
  const queryClient = useQueryClient();
  const [showAddSubjectTeacherModal, setShowAddSubjectTeacherModal] =
    useState(false);
  const [showAssignClassTeacherModal, setShowAssignClassTeacherModal] =
    useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [academicYear, setAcademicYear] = useState(
    classData?.academic_year || new Date().getFullYear().toString()
  );

  // Fetch section details including teachers
  const { data: sectionData, isLoading } = useQuery({
    queryKey: ["section", sectionId],
    queryFn: () => classesAPI.getSectionById(sectionId),
    enabled: !!sectionId,
  });

  // Assign class teacher mutation
  const assignClassTeacherMutation = useMutation({
    mutationFn: (teacherId) =>
      classesAPI.assignSectionTeacher(sectionId, teacherId),
    onSuccess: () => {
      toast.success("Class teacher assigned successfully!");
      queryClient.invalidateQueries(["section", sectionId]);
      queryClient.invalidateQueries(["class", classData?.id]);
      setShowAssignClassTeacherModal(false);
      setSelectedTeacher("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to assign class teacher");
    },
  });

  // Remove class teacher mutation
  const removeClassTeacherMutation = useMutation({
    mutationFn: () => classesAPI.removeSectionTeacher(sectionId),
    onSuccess: () => {
      toast.success("Class teacher removed successfully!");
      queryClient.invalidateQueries(["section", sectionId]);
      queryClient.invalidateQueries(["class", classData?.id]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove class teacher");
    },
  });

  // Assign subject teacher mutation
  const assignSubjectTeacherMutation = useMutation({
    mutationFn: (data) =>
      classesAPI.assignSectionSubjectTeacher(sectionId, data),
    onSuccess: () => {
      toast.success("Subject teacher assigned successfully!");
      queryClient.invalidateQueries(["section", sectionId]);
      queryClient.invalidateQueries(["class", classData?.id]);
      setShowAddSubjectTeacherModal(false);
      setSelectedTeacher("");
      setSelectedSubject("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to assign subject teacher");
    },
  });

  // Remove subject teacher mutation
  const removeSubjectTeacherMutation = useMutation({
    mutationFn: (assignmentId) =>
      classesAPI.removeSectionSubjectTeacher(assignmentId),
    onSuccess: () => {
      toast.success("Subject teacher removed successfully!");
      queryClient.invalidateQueries(["section", sectionId]);
      queryClient.invalidateQueries(["class", classData?.id]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove subject teacher");
    },
  });

  const handleAssignClassTeacher = () => {
    if (!selectedTeacher) {
      toast.error("Please select a teacher");
      return;
    }
    assignClassTeacherMutation.mutate(selectedTeacher);
  };

  const handleAssignSubjectTeacher = () => {
    if (!selectedTeacher || !selectedSubject) {
      toast.error("Please select both teacher and subject");
      return;
    }
    assignSubjectTeacherMutation.mutate({
      teacher_id: selectedTeacher,
      subject_id: selectedSubject,
      academic_year: academicYear,
    });
  };

  const section = sectionData?.data;

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="loading"></div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Section not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Class Teacher Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Class Teacher
            </h3>
          </div>
          {!section.class_teacher_id && (
            <button
              onClick={() => setShowAssignClassTeacherModal(true)}
              className="btn btn-primary btn-sm flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Class Teacher</span>
            </button>
          )}
        </div>

        {section.class_teacher_name ? (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {section.class_teacher_name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Employee ID: {section.teacher_employee_id}
                  </p>
                  {section.teacher_email && (
                    <p className="text-sm text-gray-600">
                      {section.teacher_email}
                    </p>
                  )}
                  {section.teacher_phone && (
                    <p className="text-sm text-gray-600">
                      {section.teacher_phone}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to remove this class teacher?"
                    )
                  ) {
                    removeClassTeacherMutation.mutate();
                  }
                }}
                className="text-red-600 hover:text-red-800"
                title="Remove class teacher"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No class teacher assigned</p>
          </div>
        )}
      </div>

      {/* Subject Teachers Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Subject Teachers ({section.subject_teachers?.length || 0})
            </h3>
          </div>
          <button
            onClick={() => setShowAddSubjectTeacherModal(true)}
            className="btn btn-primary btn-sm flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject Teacher</span>
          </button>
        </div>

        {section.subject_teachers && section.subject_teachers.length > 0 ? (
          <div className="space-y-3">
            {section.subject_teachers.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-gray-50 rounded-lg p-4 flex items-start justify-between"
              >
                <div className="flex items-start space-x-3 flex-1">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {assignment.teacher_name}
                    </h4>
                    <p className="text-sm text-purple-600 font-medium">
                      {assignment.subject_name}
                    </p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>ID: {assignment.employee_id}</span>
                      {assignment.teacher_email && (
                        <span>{assignment.teacher_email}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        `Are you sure you want to remove ${assignment.teacher_name} from ${assignment.subject_name}?`
                      )
                    ) {
                      removeSubjectTeacherMutation.mutate(assignment.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-800"
                  title="Remove subject teacher"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No subject teachers assigned</p>
            <p className="text-sm text-gray-400 mt-1">
              Click the button above to add teachers
            </p>
          </div>
        )}
      </div>

      {/* Assign Class Teacher Modal */}
      <Modal
        isOpen={showAssignClassTeacherModal}
        onClose={() => {
          setShowAssignClassTeacherModal(false);
          setSelectedTeacher("");
        }}
        title="Assign Class Teacher"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Teacher
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="input"
            >
              <option value="">Choose a teacher</option>
              {teachers
                .filter((t) => t.status === "active")
                .map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.first_name} {teacher.last_name} (
                    {teacher.employee_id})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setShowAssignClassTeacherModal(false);
                setSelectedTeacher("");
              }}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignClassTeacher}
              className="btn btn-primary"
              disabled={assignClassTeacherMutation.isLoading}
            >
              {assignClassTeacherMutation.isLoading ? "Assigning..." : "Assign"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Assign Subject Teacher Modal */}
      <Modal
        isOpen={showAddSubjectTeacherModal}
        onClose={() => {
          setShowAddSubjectTeacherModal(false);
          setSelectedTeacher("");
          setSelectedSubject("");
        }}
        title="Add Subject Teacher"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="input"
            >
              <option value="">Choose a subject</option>
              {subjects
                .filter((s) => s.is_active)
                .map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Teacher
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="input"
            >
              <option value="">Choose a teacher</option>
              {teachers
                .filter((t) => t.status === "active")
                .map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.first_name} {teacher.last_name} (
                    {teacher.employee_id})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Year
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="input"
              placeholder="e.g., 2024-2025"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setShowAddSubjectTeacherModal(false);
                setSelectedTeacher("");
                setSelectedSubject("");
              }}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignSubjectTeacher}
              className="btn btn-primary"
              disabled={assignSubjectTeacherMutation.isLoading}
            >
              {assignSubjectTeacherMutation.isLoading
                ? "Adding..."
                : "Add Teacher"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SectionTeachersManager;
