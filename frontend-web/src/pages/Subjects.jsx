// src/pages/Subjects.jsx
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, BookOpen, GraduationCap } from "lucide-react";
import { subjectsAPI, teachersAPI } from "../lib/api";
import { useSelector } from "react-redux";
import { selectUserRole } from "../store/slices/authSlice";
import SubjectTable from "../components/subjects/SubjectTable";
import SubjectForm from "../components/subjects/SubjectForm";
import SubjectActionsMenu from "../components/subjects/SubjectActionsMenu";
import Modal from "../components/common/Modal";
import PermissionGuard from "../components/common/PermissionGuard";
import { PERMISSIONS } from "../utils/rbac";
import toast from "react-hot-toast";

const Subjects = () => {
  const queryClient = useQueryClient();
  const userRole = useSelector(selectUserRole);
  const isTeacher = userRole === "teacher";

  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "active",
    search: "",
  });

  // Fetch subjects based on role
  const {
    data: subjectsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: isTeacher ? ["my-subjects"] : ["subjects", filters],
    queryFn: isTeacher
      ? teachersAPI.getMySubjects
      : () => subjectsAPI.getAll(filters),
  });

  const handleAddSubject = async (formData) => {
    try {
      await subjectsAPI.create(formData);
      toast.success("Subject added successfully!");
      setShowAddModal(false);
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    } catch (error) {
      toast.error(error.message || "Failed to add subject");
    }
  };

  // Student view - show enrolled subjects with file access
  if (userRole === "student") {
    const user = useSelector((state) => state.auth.user);
    const studentClassId = user?.details?.class_id;
    const studentSectionId = user?.details?.section_id;

    // Fetch class subjects for the student
    const { data: studentSubjectsData, isLoading: studentLoading } = useQuery({
      queryKey: ["student-subjects", studentClassId, studentSectionId],
      queryFn: async () => {
        // Students see subjects assigned to their class/section
        if (!studentClassId) return { data: [] };
        const response = await subjectsAPI.getAll({ status: "active" });
        return response;
      },
      enabled: !!studentClassId,
    });

    const studentSubjects = studentSubjectsData?.data || [];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Subjects</h1>
          <p className="text-gray-600 mt-1">
            View course materials and resources
          </p>
        </div>

        {/* Subjects Grid */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {studentLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loading"></div>
            </div>
          ) : studentSubjects.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No subjects assigned yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {studentSubjects.map((subject) => (
                <div
                  key={subject.id}
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-gray-500">{subject.code}</p>
                      </div>
                    </div>
                  </div>

                  {subject.description && (
                    <p className="text-sm text-gray-600 mb-4">
                      {subject.description}
                    </p>
                  )}

                  {/* Subject Actions */}
                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-500 mb-2">Quick Access</p>
                    <SubjectActionsMenu
                      subject={{
                        subject_id: subject.id,
                        subject_name: subject.name,
                        subject_code: subject.code,
                        teacher_ids: subject.teacher_ids,
                        teacher_names: subject.teacher_names,
                        teacher_user_ids: subject.teacher_user_ids,
                      }}
                      classId={studentClassId}
                      sectionId={studentSectionId}
                      teacherId={
                        subject.teacher_user_ids
                          ? parseInt(subject.teacher_user_ids.split(",")[0])
                          : null
                      }
                      teacherName={
                        subject.teacher_names
                          ? subject.teacher_names.split(",")[0]
                          : null
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Teacher view - show subjects with class/section info
  if (isTeacher) {
    const mySubjects = subjectsData?.data || [];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Subjects</h1>
          <p className="text-gray-600 mt-1">
            Subjects you are assigned to teach
          </p>
        </div>

        {/* Subjects List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loading"></div>
            </div>
          ) : mySubjects.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No subjects assigned yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Code</th>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Assignment Level</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mySubjects.map((subject, index) => (
                    <tr
                      key={`${subject.subject_id}-${subject.class_id}-${
                        subject.section_id || "all"
                      }-${index}`}
                    >
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {subject.subject_name}
                            </div>
                            {subject.subject_description && (
                              <div className="text-sm text-gray-500">
                                {subject.subject_description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {subject.subject_code}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="w-4 h-4 text-gray-400" />
                          <span>{subject.class_name}</span>
                          <span className="text-xs text-gray-500">
                            ({subject.grade_level})
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            subject.section_name === "All Sections"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {subject.section_name}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-600 capitalize">
                          {subject.assignment_level}
                        </span>
                      </td>
                      <td>
                        <SubjectActionsMenu
                          subject={subject}
                          classId={subject.class_id}
                          sectionId={subject.section_id}
                          teacherId={subject.teacher_id}
                        />
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
  }

  // Admin view - original subjects management
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-600 mt-1">Manage school subjects</p>
        </div>

        <PermissionGuard permission={PERMISSIONS.MANAGE_CLASS_SUBJECTS}>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Subject</span>
          </button>
        </PermissionGuard>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="input pl-10"
            />
          </div>

          {/* Reset Button */}
          <button
            onClick={() => setFilters({ status: "active", search: "" })}
            className="btn btn-outline flex items-center justify-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Subjects Table */}
      <SubjectTable
        subjects={subjectsData?.data || []}
        isLoading={isLoading}
        onRefetch={refetch}
      />

      {/* Add Subject Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Subject"
        size="md"
      >
        <SubjectForm
          onSubmit={handleAddSubject}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  );
};

export default Subjects;
