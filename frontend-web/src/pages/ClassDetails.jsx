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
  Clock,
  Award,
  UserCheck,
  Building,
} from "lucide-react";
import { classesAPI } from "../lib/api";
import toast from "react-hot-toast";

const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["class", id],
    queryFn: () => classesAPI.getById(id),
  });

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["class-students", id],
    queryFn: () => classesAPI.getStudents(id),
  });

  const classData = data?.data;
  const students = studentsData?.data || [];

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
          onClick={() => navigate("/classes")}
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
                Class Teacher Information
              </h3>

              {classData.class_teacher_name ? (
                <>
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Teacher Name</p>
                      <p className="font-medium text-gray-900">
                        {classData.class_teacher_name}
                      </p>
                    </div>
                  </div>

                  {classData.teacher_employee_id && (
                    <div className="flex items-start space-x-3">
                      <UserCheck className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Employee ID</p>
                        <p className="font-medium text-gray-900">
                          {classData.teacher_employee_id}
                        </p>
                      </div>
                    </div>
                  )}

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
                  <button className="btn btn-sm btn-outline mt-3">
                    Assign Teacher
                  </button>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Subject Teachers</p>
                <p className="font-medium text-gray-900">
                  {classData.subject_teachers?.length || 0} teachers assigned
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-600">Total Students</h3>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {classData.student_count || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            of {classData.capacity || 40} capacity
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-600">Subject Teachers</h3>
            <GraduationCap className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {classData.subject_teachers?.length || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">teaching staff</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-600">Sections</h3>
            <Building className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {classData.sections?.length || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">divisions</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-600">Avg Attendance</h3>
            <Award className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-orange-600">92%</p>
          <p className="text-xs text-gray-500 mt-1">this month</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                    ${
                      activeTab === tab.id
                        ? "border-purple-500 text-purple-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
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
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Class Overview
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    {classData.description ||
                      "No description available for this class."}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Attendance marked
                      </p>
                      <p className="text-sm text-gray-600">Today at 9:00 AM</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <Award className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Assignment submitted
                      </p>
                      <p className="text-sm text-gray-600">
                        Yesterday at 3:30 PM
                      </p>
                    </div>
                  </div>
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
                  Subject Teachers ({classData.subject_teachers?.length || 0})
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
                    No subject teachers assigned yet
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-medium text-gray-900">
                            {section.capacity || 40} students
                          </span>
                        </div>
                        <div className="flex justify-between">
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
    </div>
  );
};

export default ClassDetails;
