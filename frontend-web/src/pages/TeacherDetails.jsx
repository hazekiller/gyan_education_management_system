// File: frontend-web/src/pages/TeacherDetails.jsx
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Award,
  Edit,
} from "lucide-react";
import { teachersAPI } from "../lib/api";

const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

const TeacherDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["teacher", id],
    queryFn: () => teachersAPI.getById(id),
  });

  const teacher = data?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading"></div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Teacher not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/teachers")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Teachers</span>
        </button>
        <button
          onClick={() => navigate(`/teachers/${id}/edit`)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Edit className="w-5 h-5" />
          <span>Edit Teacher</span>
        </button>
      </div>

      {/* Teacher Profile Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 h-32"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-white flex items-center justify-center mb-4 md:mb-0">
              {teacher?.profile_photo ? (
                <img
                  src={`${IMAGE_URL}/${teacher.profile_photo}`}
                  alt={teacher.first_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-green-600">
                  {teacher.first_name.charAt(0)}
                </span>
              )}
            </div>
            <div className="md:ml-6 flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {teacher.first_name} {teacher.middle_name} {teacher.last_name}
              </h1>
              <p className="text-gray-600">
                Employee ID: {teacher.employee_id}
              </p>
              {teacher.specialization && (
                <p className="text-blue-600 mt-1">{teacher.specialization}</p>
              )}
            </div>
            <div className="mt-4 md:mt-0">
              <span
                className={`badge ${teacher.status === "active" ? "badge-success" : "badge-danger"
                  } text-lg px-4 py-2`}
              >
                {teacher.status}
              </span>
              <span className="badge badge-info text-lg px-4 py-2 ml-2">
                {teacher.employment_type === 'full_time' ? 'Full Time' : 'Part Time'}
              </span>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Personal Information
              </h3>

              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{teacher.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{teacher.phone}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-medium text-gray-900">
                    {new Date(teacher.date_of_birth).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Award className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {teacher.gender}
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Professional Information
              </h3>

              <div className="flex items-start space-x-3">
                <Award className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Qualification</p>
                  <p className="font-medium text-gray-900">
                    {teacher.qualification || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Briefcase className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Experience</p>
                  <p className="font-medium text-gray-900">
                    {teacher.experience_years
                      ? `${teacher.experience_years} years`
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Joining Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(teacher.joining_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Emergency Contact</p>
                  <p className="font-medium text-gray-900">
                    {teacher.emergency_contact || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Class Assignments */}
      {teacher.assignments && teacher.assignments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Class Assignments
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teacher.assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
              >
                <h4 className="font-semibold text-gray-900">
                  {assignment.class_name} - Grade {assignment.grade_level}
                </h4>
                <p className="text-sm text-gray-600">
                  {assignment.subject_name} ({assignment.subject_code})
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDetails;
