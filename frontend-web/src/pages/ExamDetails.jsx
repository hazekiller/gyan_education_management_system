import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  Edit,
  FileText,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Target,
  Activity,
} from "lucide-react";
import { examsAPI } from "../lib/api";
import ExamScheduleSection from "../components/exams/ExamScheduleSection";
import PermissionGuard from "../components/common/PermissionGuard";
import { PERMISSIONS } from "../utils/rbac";

const ExamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["exam", id],
    queryFn: () => examsAPI.getById(id),
  });

  // Backend returns { success: true, data: {...} } - single object
  const exam = data?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Exam not found</p>
        <button
          onClick={() => navigate("/exams")}
          className="mt-4 btn btn-primary"
        >
          Back to Exams
        </button>
      </div>
    );
  }

  // Calculate exam status
  const getExamStatus = () => {
    const now = new Date();
    const startDate = new Date(exam.start_date);
    const endDate = new Date(exam.end_date);

    if (now < startDate)
      return {
        status: "upcoming",
        color: "blue",
        bgColor: "bg-white",
        lightBg: "bg-white",
        textColor: "text-black",
        borderColor: "border-blue-600",
      };
    if (now >= startDate && now <= endDate)
      return {
        status: "ongoing",
        color: "blue",
        bgColor: "bg-blue-600",
        lightBg: "bg-white",
        textColor: "text-black",
        borderColor: "border-blue-600",
      };
    if (now > endDate)
      return {
        status: "completed",
        color: "gray",
        bgColor: "bg-white",
        lightBg: "bg-white",
        textColor: "text-black",
        borderColor: "border-gray-200",
      };
    return {
      status: "unknown",
      color: "gray",
      bgColor: "bg-white",
      lightBg: "bg-white",
      textColor: "text-black",
      borderColor: "border-gray-200",
    };
  };

  const examStatus = getExamStatus();

  const getExamTypeColor = (type) => {
    const colors = {
      term: "bg-white text-black border-blue-600",
      midterm: "bg-white text-black border-blue-600",
      final: "bg-white text-black border-blue-600",
      unit_test: "bg-white text-black border-blue-600",
      monthly: "bg-white text-black border-blue-600",
      quarterly: "bg-white text-black border-blue-600",
      annual: "bg-white text-black border-blue-600",
    };
    return colors[type] || "bg-white text-black border-gray-300";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDuration = () => {
    const start = new Date(exam.start_date);
    const end = new Date(exam.end_date);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const calculateTimeRemaining = () => {
    const now = new Date();
    const startDate = new Date(exam.start_date);
    const endDate = new Date(exam.end_date);

    if (now < startDate) {
      const diff = startDate - now;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return `Starts in ${days} ${days === 1 ? "day" : "days"}`;
    } else if (now >= startDate && now <= endDate) {
      const diff = endDate - now;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return `Ends in ${days} ${days === 1 ? "day" : "days"}`;
    } else {
      const diff = now - endDate;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      return `Ended ${days} ${days === 1 ? "day" : "days"} ago`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/exams")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Exams</span>
        </button>
        <PermissionGuard permission={PERMISSIONS.CREATE_EXAMS}>
          <button
            onClick={() => navigate(`/exams/${id}/edit`)}
            className="btn btn-primary flex items-center space-x-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Edit className="w-5 h-5" />
            <span>Edit Exam</span>
          </button>
        </PermissionGuard>
      </div>

      {/* Exam Profile Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header with gradient */}
        <div
          className={`${examStatus.status === 'ongoing' ? 'bg-blue-600' : 'bg-blue-600'} h-24 relative`}
        >
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center space-x-3">
              <span
                className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full capitalize bg-white bg-opacity-20 text-white backdrop-blur-sm border border-white border-opacity-30`}
              >
                {examStatus.status}
              </span>
              <span
                className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full bg-white bg-opacity-20 text-white backdrop-blur-sm border border-white border-opacity-30`}
              >
                {calculateTimeRemaining()}
              </span>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end mb-6">
            <div className="w-32 h-32 rounded-2xl border-4 border-white bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 md:mb-0 shadow-2xl">
              <BookOpen className="w-16 h-16 text-white" />
            </div>
            <div className="md:ml-6 flex-1">
              <h1 className="text-4xl font-bold text-black mb-2">
                {exam.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`px-3 py-1.5 inline-flex text-sm font-semibold rounded-lg border-2 ${getExamTypeColor(
                    exam.exam_type
                  )}`}
                >
                  {exam.exam_type.replace("_", " ").toUpperCase()}
                </span>
                <span className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  Academic Year: {exam.academic_year}
                </span>
                <span
                  className={`flex items-center px-3 py-1.5 rounded-lg ${exam.is_active
                      ? "bg-white text-black border border-blue-600"
                      : "bg-white text-black border border-gray-200"
                    }`}
                >
                  <Activity className="w-4 h-4 mr-1.5 text-blue-600" />
                  {exam.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {exam.description && (
            <div
              className={`mb-8 p-4 rounded-xl ${examStatus.lightBg} border border-${examStatus.color}-200`}
            >
              <p className={`text-sm ${examStatus.textColor} leading-relaxed`}>
                {exam.description}
              </p>
            </div>
          )}

          {/* Key Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm text-black font-medium mb-1">
                Total Marks
              </p>
              <p className="text-3xl font-bold text-black">
                {exam.total_marks}
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm text-black font-medium mb-1">
                Passing Marks
              </p>
              <p className="text-3xl font-bold text-black">
                {exam.passing_marks}
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm text-black font-medium mb-1">
                Pass Percentage
              </p>
              <p className="text-3xl font-bold text-black">
                {((exam.passing_marks / exam.total_marks) * 100).toFixed(1)}%
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm text-black font-medium mb-1">
                Duration
              </p>
              <p className="text-3xl font-bold text-black">
                {calculateDuration()}
                <span className="text-lg ml-1">
                  {calculateDuration() === 1 ? "day" : "days"}
                </span>
              </p>
            </div>
          </div>

          {/* Exam Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Schedule Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center border-b-2 border-gray-200 pb-3">
                <Calendar className="w-6 h-6 mr-2 text-blue-600" />
                Schedule Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-black mb-1">
                      Start Date
                    </p>
                    <p className="text-lg font-bold text-black">
                      {formatDate(exam.start_date)}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {formatDateShort(exam.start_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-black mb-1">
                      End Date
                    </p>
                    <p className="text-lg font-bold text-black">
                      {formatDate(exam.end_date)}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {formatDateShort(exam.end_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-black mb-1">
                      Class
                    </p>
                    <p className="text-lg font-bold text-black">
                      {exam.class_name || `Class ${exam.class_id}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center border-b-2 border-gray-200 pb-3">
                <FileText className="w-6 h-6 mr-2 text-purple-600" />
                Additional Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-white border border-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-black mb-1">
                      Exam Type
                    </p>
                    <p className="text-lg font-bold text-black capitalize">
                      {exam.exam_type.replace("_", " ")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-white border border-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-black mb-1">
                      Created Date
                    </p>
                    <p className="text-lg font-bold text-black">
                      {formatDate(exam.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-white border border-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-black mb-1">
                      Status
                    </p>
                    <p className="text-lg font-bold text-black">
                      {exam.is_active ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-black">
              Total Students
            </h3>
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-4xl font-bold text-black mb-2">0</p>
          <p className="text-xs text-black opacity-70">Enrolled in this exam</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-black">
              Results Entered
            </h3>
            <CheckCircle className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-4xl font-bold text-black mb-2">0</p>
          <p className="text-xs text-black opacity-70">Out of 0 students</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-black">Pass Rate</h3>
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-4xl font-bold text-black mb-2">--</p>
          <p className="text-xs text-black opacity-70">Percentage of passed</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-black">
              Average Score
            </h3>
            <Award className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-4xl font-bold text-black mb-2">--</p>
          <p className="text-xs text-black opacity-70">Out of {exam.total_marks}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            className="btn btn-outline flex items-center justify-center space-x-2 h-14 rounded-xl border-2 hover:shadow-lg transition-all"
            onClick={() => navigate(`/exams/${id}/schedule`)}
          >
            <Calendar className="w-5 h-5" />
            <span className="font-semibold">View Schedule</span>
          </button>
          <button
            className="btn btn-primary flex items-center justify-center space-x-2 h-14 rounded-xl shadow-md hover:shadow-xl transition-all"
            onClick={() => navigate(`/exams/${id}/results`)}
          >
            <FileText className="w-5 h-5" />
            <span className="font-semibold">Enter Results</span>
          </button>
          <button
            className="btn btn-outline flex items-center justify-center space-x-2 h-14 rounded-xl border-2 hover:shadow-lg transition-all"
            onClick={() => navigate(`/exams/${id}/report`)}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">View Report</span>
          </button>
        </div>
      </div>

      {/* Exam Schedule Section */}
      <ExamScheduleSection examId={id} examData={exam} />
    </div>
  );
};

export default ExamDetails;
