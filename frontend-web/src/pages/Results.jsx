import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../store/slices/authSlice";
import { resultsAPI } from "../lib/api";
import {
  FileText,
  Download,
  Award,
  TrendingUp,
  Calendar,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const Results = () => {
  const user = useSelector(selectCurrentUser);
  const [selectedExam, setSelectedExam] = useState(null);

  // Get student ID from user
  const studentId = user?.student_id || user?.id;

  // Fetch all results for the student
  const {
    data: resultsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["studentResults", studentId],
    queryFn: () => resultsAPI.getStudentResults(studentId),
    enabled: !!studentId,
  });

  // Fetch detailed results for selected exam
  const { data: examResultsData, isLoading: isLoadingExamResults } = useQuery({
    queryKey: ["studentExamResults", studentId, selectedExam],
    queryFn: () => resultsAPI.getStudentExamResults(studentId, selectedExam),
    enabled: !!selectedExam && !!studentId,
  });

  const handleDownloadPDF = async (examId) => {
    try {
      await resultsAPI.downloadResultPDF(studentId, examId);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF. Please try again.");
    }
  };

  const getGradeColor = (grade) => {
    const colors = {
      "A+": "text-green-600 bg-green-50",
      A: "text-green-500 bg-green-50",
      "B+": "text-blue-600 bg-blue-50",
      B: "text-blue-500 bg-blue-50",
      "C+": "text-yellow-600 bg-yellow-50",
      C: "text-yellow-500 bg-yellow-50",
      D: "text-orange-500 bg-orange-50",
      F: "text-red-600 bg-red-50",
    };
    return colors[grade] || "text-gray-600 bg-gray-50";
  };

  const getStatusBadge = (status) => {
    if (status === "published") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Published
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <AlertCircle className="w-3 h-3 mr-1" />
        Pending
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Results
          </h3>
          <p className="text-gray-600">
            {error.message || "Failed to load results"}
          </p>
        </div>
      </div>
    );
  }

  const student = resultsData?.data?.student;
  const exams = resultsData?.data?.exams || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Exam Results
        </h1>
        <p className="text-gray-600">
          View your exam performance and download marksheets
        </p>
      </div>

      {/* Student Info Card */}
      {student && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {student.first_name} {student.middle_name} {student.last_name}
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="opacity-90">Admission No:</span>
                  <span className="ml-2 font-semibold">
                    {student.admission_number}
                  </span>
                </div>
                <div>
                  <span className="opacity-90">Roll No:</span>
                  <span className="ml-2 font-semibold">
                    {student.roll_number || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="opacity-90">Class:</span>
                  <span className="ml-2 font-semibold">
                    {student.class_name}
                  </span>
                </div>
                <div>
                  <span className="opacity-90">Section:</span>
                  <span className="ml-2 font-semibold">
                    {student.section_name}
                  </span>
                </div>
              </div>
            </div>
            <Award className="w-20 h-20 opacity-20" />
          </div>
        </div>
      )}

      {/* Exams List */}
      {!selectedExam ? (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            All Exams
          </h3>

          {exams.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Exams Found
              </h3>
              <p className="text-gray-600">
                There are no exams scheduled for your class yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {exam.name}
                        </h4>
                        <p className="text-sm text-gray-600 capitalize">
                          {exam.exam_type.replace("_", " ")}
                        </p>
                      </div>
                      {getStatusBadge(exam.status)}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(exam.start_date).toLocaleDateString()} -{" "}
                        {new Date(exam.end_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Academic Year: {exam.academic_year}
                      </div>
                    </div>

                    {exam.status === "published" && exam.percentage !== null ? (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Performance
                          </span>
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-2xl font-bold text-gray-900">
                              {exam.percentage}%
                            </span>
                            <span className="text-sm text-gray-600 ml-2">
                              ({exam.total_marks_obtained}/
                              {exam.total_max_marks})
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-yellow-800 text-center">
                          Results not published yet
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedExam(exam.id)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                        disabled={exam.status !== "published"}
                      >
                        View Details
                      </button>
                      {exam.status === "published" && (
                        <button
                          onClick={() => handleDownloadPDF(exam.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                          title="Download Marksheet"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Detailed Exam Results */
        <div>
          <button
            onClick={() => setSelectedExam(null)}
            className="mb-6 text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            ← Back to All Exams
          </button>

          {isLoadingExamResults ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading exam results...</p>
            </div>
          ) : examResultsData?.data ? (
            <div>
              {/* Exam Header */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {examResultsData.data.exam.name}
                    </h3>
                    <p className="text-gray-600 capitalize">
                      {examResultsData.data.exam.exam_type.replace("_", " ")} •{" "}
                      {examResultsData.data.exam.academic_year}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadPDF(selectedExam)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Marksheet
                  </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium mb-1">
                      Total Marks
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {examResultsData.data.summary.totalMarksObtained}/
                      {examResultsData.data.summary.totalMaxMarks}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-medium mb-1">
                      Percentage
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {examResultsData.data.summary.percentage}%
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 font-medium mb-1">
                      Overall Grade
                    </p>
                    <p className="text-2xl font-bold text-purple-900">
                      {examResultsData.data.summary.overallGrade}
                    </p>
                  </div>
                  <div
                    className={`rounded-lg p-4 ${
                      parseFloat(examResultsData.data.summary.percentage) >=
                      examResultsData.data.exam.passing_marks
                        ? "bg-green-50"
                        : "bg-red-50"
                    }`}
                  >
                    <p
                      className={`text-sm font-medium mb-1 ${
                        parseFloat(examResultsData.data.summary.percentage) >=
                        examResultsData.data.exam.passing_marks
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      Result
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        parseFloat(examResultsData.data.summary.percentage) >=
                        examResultsData.data.exam.passing_marks
                          ? "text-green-900"
                          : "text-red-900"
                      }`}
                    >
                      {parseFloat(examResultsData.data.summary.percentage) >=
                      examResultsData.data.exam.passing_marks
                        ? "PASSED"
                        : "FAILED"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subject-wise Results */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Subject-wise Performance
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Marks Obtained
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Max Marks
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grade
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {examResultsData.data.results.map((result) => {
                        const percentage = (
                          (result.marks_obtained / result.max_marks) *
                          100
                        ).toFixed(2);
                        return (
                          <tr key={result.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {result.subject_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {result.subject_code}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="text-sm font-semibold text-gray-900">
                                {result.marks_obtained}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="text-sm text-gray-600">
                                {result.max_marks}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="text-sm font-medium text-gray-900">
                                {percentage}%
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(
                                  result.grade
                                )}`}
                              >
                                {result.grade}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Results Available
              </h3>
              <p className="text-gray-600">
                Results for this exam have not been published yet.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Results;
