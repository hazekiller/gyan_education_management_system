// File: frontend-web/src/pages/StudentDetails.jsx
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Edit
} from 'lucide-react';
import { studentsAPI } from '../lib/api';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentsAPI.getById(id)
  });

  const student = data?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Student not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/students')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Students</span>
        </button>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/student-reports/${id}`)}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <FileText className="w-5 h-5" />
            <span>View Reports</span>
          </button>
          <button
            onClick={() => navigate(`/students/${id}/edit`)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Edit className="w-5 h-5" />
            <span>Edit Student</span>
          </button>
        </div>
      </div>

      {/* Student Profile Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-white flex items-center justify-center mb-4 md:mb-0">
              {student.profile_photo ? (
                <img
                  src={`http://localhost:5000/${student.profile_photo}`}
                  alt={student.first_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-blue-600">
                  {student.first_name.charAt(0)}
                </span>
              )}
            </div>
            <div className="md:ml-6 flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {student.first_name} {student.middle_name} {student.last_name}
              </h1>
              <p className="text-gray-600">
                {student.class_name} - {student.section_name} • Roll No: {student.roll_number}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className={`badge ${student.status === 'active' ? 'badge-success' : 'badge-danger'
                } text-lg px-4 py-2`}>
                {student.status}
              </span>
            </div>
          </div>

          {/* Student Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Personal Information
              </h3>

              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Admission Number</p>
                  <p className="font-medium text-gray-900">{student.admission_number}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-medium text-gray-900">
                    {new Date(student.date_of_birth).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-medium text-gray-900 capitalize">{student.gender}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Blood Group</p>
                  <p className="font-medium text-gray-900">{student.blood_group || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{student.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{student.phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Parent & Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Parent & Address Information
              </h3>

              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Father's Name</p>
                  <p className="font-medium text-gray-900">{student.father_name || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Mother's Name</p>
                  <p className="font-medium text-gray-900">{student.mother_name || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Parent Phone</p>
                  <p className="font-medium text-gray-900">{student.parent_phone}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Parent Email</p>
                  <p className="font-medium text-gray-900">{student.parent_email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">
                    {student.address ? (
                      <>
                        {student.address}<br />
                        {student.city}, {student.state} {student.pincode}
                      </>
                    ) : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Admission Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(student.admission_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm text-gray-600 mb-2">Attendance Rate</h3>
          <p className="text-3xl font-bold text-green-600">95%</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm text-gray-600 mb-2">Average Grade</h3>
          <p className="text-3xl font-bold text-blue-600">A</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm text-gray-600 mb-2">Assignments Completed</h3>
          <p className="text-3xl font-bold text-purple-600">24/26</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;