import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";
import { classesAPI, teachersAPI, subjectsAPI } from "../lib/api";
import SectionTeachersManager from "../components/sections/SectionTeachersManager";
import Modal from "../components/common/Modal";
// import toast from "react-hot-toast";

const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSection, setSelectedSection] = useState(null);
  const [showSectionTeachersModal, setShowSectionTeachersModal] =
    useState(false);

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

  const classData = data?.data;
  const students = studentsData?.data || [];
  const teachers = teachersData?.data || [];
  const subjects = subjectsData?.data || [];

  const handleManageSectionTeachers = (section) => {
    setSelectedSection(section);
    setShowSectionTeachersModal(true);
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
    { id: "students", label: "Students", icon: Users },
    { id: "teachers", label: "Teachers", icon: GraduationCap },
    { id: "sections", label: "Sections", icon: Building },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/class")}
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
                Class Teacher Information (Legacy)
              </h3>

              {classData.class_teacher_name ? (
                <>
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-gray-900">
                        {classData.class_teacher_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Employee ID</p>
                      <p className="font-medium text-gray-900">
                        {classData.teacher_employee_id}
                      </p>
                    </div>
                  </div>

                  {classData.teacher_email && (
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">
                          {classData.teacher_email}
                        </p>
                      </div>
                    </div>
                  )}

                  {classData.teacher_phone && (
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">
                          {classData.teacher_phone}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No class teacher assigned</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Class teachers are now managed at section level
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
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
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
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">
                      Total Students
                    </p>
                    <p className="text-3xl font-bold text-blue-900">
                      {classData.student_count || 0}
                    </p>
                  </div>
                  <Users className="w-12 h-12 text-blue-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">
                      Total Sections
                    </p>
                    <p className="text-3xl font-bold text-purple-900">
                      {classData.sections?.length || 0}
                    </p>
                  </div>
                  <Building className="w-12 h-12 text-purple-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">
                      Subject Teachers
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      {classData.subject_teachers?.length || 0}
                    </p>
                  </div>
                  <GraduationCap className="w-12 h-12 text-green-400" />
                </div>
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === "students" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Students ({students.length})
                </h3>
                <button className="btn btn-primary btn-sm">Add Student</button>
              </div>

              {studentsLoading ? (
                <div className="text-center py-8">
                  <div className="loading"></div>
                </div>
              ) : students.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Roll No
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Section
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr
                          key={student.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate(`/students/${student.id}`)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {student.roll_number || "N/A"}
                          </td>
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
          {activeTab === "teachers" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Subject Teachers (Class Level - Legacy) (
                  {classData.subject_teachers?.length || 0})
                </h3>
                <button className="btn btn-primary btn-sm">
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
          )}

          {/* Sections Tab */}
          {activeTab === "sections" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Sections ({classData.sections?.length || 0})
                </h3>
                <button className="btn btn-primary btn-sm">Add Section</button>
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
    </div>
  );
};

export default ClassDetails;
