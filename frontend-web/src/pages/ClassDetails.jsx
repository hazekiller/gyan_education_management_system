import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Users,
  BookOpen,
  Calendar,
  User,
  Edit,
  MapPin,
  GraduationCap,
  Building,
  UserCheck,
  Plus,
  Trash2,
  BookText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { classesAPI, teachersAPI, subjectsAPI } from "../lib/api";
import SectionTeachersManager from "../components/sections/SectionTeachersManager";
import ClassSubjectsManager from "../components/classes/ClassSubjectsManager";
import Modal from "../components/common/Modal";
import toast from "react-hot-toast";

const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSection, setSelectedSection] = useState(null);
  const [showSectionTeachersModal, setShowSectionTeachersModal] =
    useState(false);
  const [showClassSubjectsModal, setShowClassSubjectsModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionCapacity, setNewSectionCapacity] = useState("");
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["class", id],
    queryFn: () => classesAPI.getById(id),
  });

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["class-students", id],
    queryFn: () => classesAPI.getStudents(id),
  });

  const { data: teachersData } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => teachersAPI.getAll({ limit: 1000 }),
  });

  const { data: subjectsData } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => subjectsAPI.getAll(),
  });

  // Fetch class subjects
  const { data: classSubjectsData, isLoading: classSubjectsLoading } = useQuery(
    {
      queryKey: ["class-subjects", id],
      queryFn: () => classesAPI.getClassSubjects(id),
      enabled: !!id,
    }
  );

  const classData = data?.data;
  const students = studentsData?.data || [];
  const teachers = teachersData?.data || [];
  const subjects = subjectsData?.data || [];
  const classSubjects = classSubjectsData?.data || [];

  const handleManageSectionTeachers = (section) => {
    setSelectedSection(section);
    setShowSectionTeachersModal(true);
  };

  // Add section mutation
  const addSectionMutation = useMutation({
    mutationFn: (data) => classesAPI.createSection(id, data),
    onSuccess: () => {
      toast.success("Section created successfully");
      setShowAddSectionModal(false);
      setNewSectionName("");
      setNewSectionCapacity("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create section");
    },
  });

  const handleAddSection = (e) => {
    e.preventDefault();

    if (!newSectionName.trim()) {
      toast.error("Section name is required");
      return;
    }

    addSectionMutation.mutate({
      name: newSectionName.trim(),
      capacity: newSectionCapacity ? parseInt(newSectionCapacity) : null,
      is_active: true,
    });
  };

  // Assign teacher mutation
  const assignTeacherMutation = useMutation({
    mutationFn: (data) => classesAPI.assignTeacher(id, data),
    onSuccess: () => {
      toast.success("Teacher assigned successfully");
      setShowAssignTeacherModal(false);
      setSelectedTeacherId("");
      setSelectedSubjectId("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to assign teacher");
    },
  });

  const handleAssignTeacher = (e) => {
    e.preventDefault();

    if (!selectedTeacherId || !selectedSubjectId) {
      toast.error("Please select both teacher and subject");
      return;
    }

    assignTeacherMutation.mutate({
      teacher_id: selectedTeacherId,
      subject_id: selectedSubjectId,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Class not found</p>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "subjects", label: "Subjects", icon: BookText }, // NEW TAB
    { id: "students", label: "Students", icon: Users },
    // { id: "teachers", label: "Teachers", icon: GraduationCap },
    { id: "sections", label: "Sections", icon: Building },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/classesx")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Classes</span>
        </button>
        <button
          onClick={() => navigate(`/classes/${id}/edit`)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Edit className="w-5 h-5" />
          <span>Edit Class</span>
        </button>
      </div>

      {/* Class Profile Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-32"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-white flex items-center justify-center mb-4 md:mb-0">
              <BookOpen className="w-16 h-16 text-purple-600" />
            </div>
            <div className="md:ml-6 flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {classData.name}
              </h1>
              <p className="text-gray-600">
                Grade {classData.grade_level} • Academic Year:{" "}
                {classData.academic_year}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span
                className={`badge ${
                  classData.status === "active"
                    ? "badge-success"
                    : classData.status === "inactive"
                    ? "badge-warning"
                    : "badge-secondary"
                } text-lg px-4 py-2`}
              >
                {classData.status || "active"}
              </span>
            </div>
          </div>

          {/* Class Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Class Information
              </h3>

              <div className="flex items-start space-x-3">
                <GraduationCap className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Grade Level</p>
                  <p className="font-medium text-gray-900">
                    Grade {classData.grade_level}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Academic Year</p>
                  <p className="font-medium text-gray-900">
                    {classData.academic_year}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Room Number</p>
                  <p className="font-medium text-gray-900">
                    {classData.room_number || "Not assigned"}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Class Capacity</p>
                  <p className="font-medium text-gray-900">
                    {classData.student_count || 0} / {classData.capacity || 40}{" "}
                    students
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Building className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Total Sections</p>
                  <p className="font-medium text-gray-900">
                    {classData.sections?.length || 0} sections
                  </p>
                </div>
              </div>

              {classData.description && (
                <div className="flex items-start space-x-3">
                  <BookOpen className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="font-medium text-gray-900">
                      {classData.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Class Teacher Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Class Teacher
              </h3>
              {classData.class_teacher ? (
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {classData.class_teacher.first_name}{" "}
                        {classData.class_teacher.last_name}
                      </h4>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {classData.class_teacher.email}
                        </span>
                        {classData.class_teacher.phone && (
                          <span className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {classData.class_teacher.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    No class teacher assigned
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">
                      Total Students
                    </p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">
                      {classData.student_count || 0}
                    </p>
                  </div>
                  <Users className="w-12 h-12 text-blue-400" />
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">
                      Sections
                    </p>
                    <p className="text-3xl font-bold text-purple-900 mt-2">
                      {classData.sections?.length || 0}
                    </p>
                  </div>
                  <Building className="w-12 h-12 text-purple-400" />
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">
                      Subjects
                    </p>
                    <p className="text-3xl font-bold text-green-900 mt-2">
                      {classSubjects.length || 0}
                    </p>
                  </div>
                  <BookText className="w-12 h-12 text-green-400" />
                </div>
              </div>
            </div>
          )}

          {/* NEW: Subjects Tab */}
          {activeTab === "subjects" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Class Subjects ({classSubjects.length})
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage subjects and assign teachers for this class
                  </p>
                </div>
                <button
                  onClick={() => setShowClassSubjectsModal(true)}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Manage Subjects</span>
                </button>
              </div>

              {classSubjectsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="loading"></div>
                </div>
              ) : classSubjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classSubjects.map((subject) => (
                    <div
                      key={subject.assignment_id}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <BookText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {subject.subject_name}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {subject.subject_code}
                            </span>
                          </div>
                        </div>
                        {subject.is_active === 1 ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Teacher:</span>
                          <span className="font-medium text-gray-900">
                            {subject.teacher_first_name
                              ? `${subject.teacher_first_name} ${subject.teacher_last_name}`
                              : "Not assigned"}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Academic Year:</span>
                          <span className="font-medium text-gray-900">
                            {subject.academic_year}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-blue-100">
                        <p className="text-xs text-gray-600 mb-2">
                          Applied to all sections by default
                        </p>
                        <button
                          onClick={() => setShowClassSubjectsModal(true)}
                          className="w-full btn btn-sm btn-outline text-xs"
                        >
                          Edit Assignment
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <BookText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium mb-1">
                    No subjects assigned yet
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Start by adding subjects to this class
                  </p>
                  <button
                    onClick={() => setShowClassSubjectsModal(true)}
                    className="btn btn-primary inline-flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Subjects</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Students Tab */}
          {activeTab === "students" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Students ({students.length})
                </h3>
              </div>

              {studentsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="loading"></div>
                </div>
              ) : students.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Section
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                <span className="text-blue-600 font-semibold text-xs">
                                  {student.first_name?.charAt(0)}
                                </span>
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {student.first_name} {student.last_name}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {student.section_name || "N/A"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {student.email}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                student.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {student.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No students enrolled yet</p>
                </div>
              )}
            </div>
          )}

          {/* Teachers Tab */}
          {/* {activeTab === "teachers" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Subject Teachers (Class Level - Legacy) (
                  {classData.subject_teachers?.length || 0})
                </h3>
                <button
                  onClick={() => setShowAssignTeacherModal(true)}
                  className="btn btn-primary btn-sm"
                >
                  Assign Teacher
                </button>
              </div>

              {classData.subject_teachers &&
              classData.subject_teachers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classData.subject_teachers.map((teacher) => (
                    <div key={teacher.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                          <User className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {teacher.teacher_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {teacher.subject_name}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {teacher.teacher_email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">
                    No subject teachers assigned at class level
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Teachers are now managed at section level
                  </p>
                </div>
              )}
            </div>
          )} */}

          {/* Sections Tab */}
          {activeTab === "sections" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Sections ({classData.sections?.length || 0})
                </h3>
                <button
                  onClick={() => setShowAddSectionModal(true)}
                  className="btn btn-primary btn-sm"
                >
                  Add Section
                </button>
              </div>

              {classData.sections && classData.sections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classData.sections.map((section) => (
                    <div
                      key={section.id}
                      className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-100"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-2xl font-bold text-purple-600">
                          Section {section.name}
                        </h4>
                        <Building className="w-6 h-6 text-purple-400" />
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Students:</span>
                          <span className="font-medium text-gray-900">
                            {section.student_count || 0} /{" "}
                            {section.capacity || 40}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Class Teacher:</span>
                          <span className="font-medium text-gray-900">
                            {section.class_teacher_name || "Not assigned"}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Subject Teachers:
                          </span>
                          <span className="font-medium text-gray-900">
                            {section.subject_teachers?.length || 0}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Status:</span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              section.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {section.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleManageSectionTeachers(section)}
                        className="w-full btn btn-primary btn-sm flex items-center justify-center space-x-1"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Manage Teachers</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Building className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No sections created yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Section Teachers Modal */}
      <Modal
        isOpen={showSectionTeachersModal}
        onClose={() => {
          setShowSectionTeachersModal(false);
          setSelectedSection(null);
        }}
        title={`Manage Teachers - Section ${selectedSection?.name}`}
        size="large"
      >
        {selectedSection && (
          <SectionTeachersManager
            sectionId={selectedSection.id}
            classData={classData}
            teachers={teachers}
            subjects={subjects}
          />
        )}
      </Modal>

      {/* Class Subjects Modal */}
      <Modal
        isOpen={showClassSubjectsModal}
        onClose={() => setShowClassSubjectsModal(false)}
        title={`Manage Subjects - ${classData.name}`}
        size="xlarge"
      >
        <ClassSubjectsManager
          classId={id}
          classData={classData}
          teachers={teachers}
          subjects={subjects}
          onClose={() => {
            setShowClassSubjectsModal(false);
            queryClient.invalidateQueries(["class-subjects", id]);
          }}
        />
      </Modal>

      {/* Add Section Modal */}
      <Modal
        isOpen={showAddSectionModal}
        onClose={() => {
          setShowAddSectionModal(false);
          setNewSectionName("");
          setNewSectionCapacity("");
        }}
        title="Add New Section"
        size="md"
      >
        <form onSubmit={handleAddSection} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              className="input w-full"
              placeholder="e.g., A, B, Alpha, Beta"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a single letter or name for the section
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity (Optional)
            </label>
            <input
              type="number"
              value={newSectionCapacity}
              onChange={(e) => setNewSectionCapacity(e.target.value)}
              className="input w-full"
              placeholder="e.g., 40"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to use default capacity ({classData.capacity || 40})
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowAddSectionModal(false);
                setNewSectionName("");
                setNewSectionCapacity("");
              }}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={addSectionMutation.isLoading}
            >
              {addSectionMutation.isLoading ? "Creating..." : "Create Section"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Teacher Modal */}
      {/* <Modal
        isOpen={showAssignTeacherModal}
        onClose={() => {
          setShowAssignTeacherModal(false);
          setSelectedTeacherId("");
          setSelectedSubjectId("");
        }}
        title="Assign Subject Teacher"
        size="medium"
      >
        <form onSubmit={handleAssignTeacher} className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This is a legacy feature. Teachers are now
              primarily managed at the section level. Consider using
              section-based teacher assignments in the "Sections" tab instead.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Subject <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="input w-full"
              required
            >
              <option value="">Choose a subject...</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Teacher <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="input w-full"
              required
            >
              <option value="">Choose a teacher...</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.first_name} {teacher.last_name}
                  {teacher.employee_id ? ` (${teacher.employee_id})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowAssignTeacherModal(false);
                setSelectedTeacherId("");
                setSelectedSubjectId("");
              }}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={assignTeacherMutation.isLoading}
            >
              {assignTeacherMutation.isLoading
                ? "Assigning..."
                : "Assign Teacher"}
            </button>
          </div>
        </form>
      </Modal> */}
    </div>
  );
};

export default ClassDetails;
