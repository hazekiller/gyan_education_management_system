import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Save,
  BookOpen,
  Users,
  Award,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { examsAPI, examScheduleAPI, studentsAPI } from "../lib/api";
import toast from "react-hot-toast";

const ExamResults = () => {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get current user info
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role;
  const isStudent = userRole === "student";

  const [selectedSubject, setSelectedSubject] = useState("");
  const [results, setResults] = useState({});

  // Fetch exam details
  const { data: examData } = useQuery({
    queryKey: ["exam", examId],
    queryFn: () => examsAPI.getById(examId),
  });

  const exam = examData?.data;

  // Fetch exam schedule
  const { data: scheduleData } = useQuery({
    queryKey: ["exam-schedules", examId],
    queryFn: () => examScheduleAPI.getExamSchedules(examId),
    enabled: !!examId,
  });

  const schedules = scheduleData?.data || [];

  // Fetch students from exam's class (only for teachers/admins)
  const { data: studentsData } = useQuery({
    queryKey: ["students", exam?.class_id],
    queryFn: () =>
      studentsAPI.getAll({ class_id: exam?.class_id, status: "active" }),
    enabled: !!exam?.class_id && !isStudent,
  });

  const students = studentsData?.data || [];

  // Fetch existing results for selected subject
  // For students: fetch their own results
  // For teachers/admins: fetch all results for the subject
  const { data: existingResultsData } = useQuery({
    queryKey: [
      "exam-results",
      examId,
      selectedSubject,
      isStudent ? user?.student_id : "all",
    ],
    queryFn: () => {
      if (isStudent && user?.student_id) {
        return examsAPI.getStudentResults(examId, user.student_id);
      }
      return examsAPI.getResults(examId, selectedSubject);
    },
    enabled: !!examId && !!selectedSubject,
  });

  const existingResults = existingResultsData?.data || [];

  // Get max marks for selected subject from schedule
  const selectedSchedule = useMemo(() => {
    return schedules.find((s) => s.subject_id === parseInt(selectedSubject));
  }, [schedules, selectedSubject]);

  // Initialize results when existing results are loaded
  useEffect(() => {
    if (existingResults.length > 0) {
      const resultsMap = {};
      existingResults.forEach((result) => {
        resultsMap[result.student_id] = {
          marks_obtained: result.marks_obtained,
          remarks: result.remarks || "",
        };
      });
      setResults(resultsMap);
    } else if (selectedSubject) {
      // Reset results when changing subject
      setResults({});
    }
  }, [existingResults, selectedSubject]);

  // Save results mutation
  const saveMutation = useMutation({
    mutationFn: (data) => examsAPI.enterResults(examId, data),
    onSuccess: () => {
      toast.success("Results saved successfully");
      queryClient.invalidateQueries(["exam-results"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to save results");
    },
  });

  const handleMarksChange = (studentId, marks) => {
    setResults((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marks_obtained: marks,
      },
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setResults((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const calculateGrade = (marks, maxMarks) => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 90) return { grade: "A+", color: "text-green-600" };
    if (percentage >= 80) return { grade: "A", color: "text-green-500" };
    if (percentage >= 70) return { grade: "B+", color: "text-blue-600" };
    if (percentage >= 60) return { grade: "B", color: "text-blue-500" };
    if (percentage >= 50) return { grade: "C+", color: "text-yellow-600" };
    if (percentage >= 40) return { grade: "C", color: "text-yellow-500" };
    if (percentage >= 33) return { grade: "D", color: "text-orange-500" };
    return { grade: "F", color: "text-red-600" };
  };

  const handleSave = () => {
    if (!selectedSubject) {
      toast.error("Please select a subject");
      return;
    }

    if (!selectedSchedule) {
      toast.error("Subject schedule not found");
      return;
    }

    // Prepare results array
    const resultsArray = students
      .filter((student) => results[student.id]?.marks_obtained !== undefined)
      .map((student) => ({
        student_id: student.id,
        subject_id: parseInt(selectedSubject),
        marks_obtained: parseFloat(results[student.id].marks_obtained),
        max_marks: selectedSchedule.max_marks,
        remarks: results[student.id].remarks || "",
      }));

    if (resultsArray.length === 0) {
      toast.error("Please enter marks for at least one student");
      return;
    }

    // Validate marks
    const invalidMarks = resultsArray.find(
      (r) => r.marks_obtained > r.max_marks || r.marks_obtained < 0
    );

    if (invalidMarks) {
      toast.error("Marks must be between 0 and " + selectedSchedule.max_marks);
      return;
    }

    saveMutation.mutate({ results: resultsArray });
  };

  if (!exam) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/exams/${examId}`)}
            className="btn btn-outline flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enter Results</h1>
            <p className="text-gray-600 mt-1">{exam.name}</p>
          </div>
        </div>
        {!isStudent && (
          <button
            onClick={handleSave}
            disabled={!selectedSubject || saveMutation.isPending}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{saveMutation.isPending ? "Saving..." : "Save Results"}</span>
          </button>
        )}
        {isStudent && (
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
            <AlertCircle className="w-4 h-4 inline mr-2" />
            View Only - You cannot edit results
          </div>
        )}
      </div>

      {/* Subject Selector */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            Select Subject
          </h3>
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="input w-full max-w-md"
        >
          <option value="">Choose a subject...</option>
          {schedules.map((schedule) => (
            <option key={schedule.id} value={schedule.subject_id}>
              {schedule.subject_name} ({schedule.subject_code}) - Max Marks:{" "}
              {schedule.max_marks}
            </option>
          ))}
        </select>
        {schedules.length === 0 && (
          <p className="text-yellow-600 text-sm mt-2">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            No exam schedule found. Please add exam schedule first.
          </p>
        )}
      </div>

      {/* Results Entry Table */}
      {selectedSubject && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Students ({students.length})
                </h3>
              </div>
              <div className="text-sm text-gray-600">
                Max Marks:{" "}
                <span className="font-semibold">
                  {selectedSchedule?.max_marks}
                </span>
              </div>
            </div>
          </div>

          {students.length === 0 && !isStudent ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No students found in this class</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {!isStudent && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roll No
                      </th>
                    )}
                    {!isStudent && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                    )}
                    {!isStudent && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admission No
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marks Obtained
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isStudent
                    ? // Student view - show only their own result
                      existingResults.map((result) => {
                        const gradeInfo = calculateGrade(
                          result.marks_obtained,
                          result.max_marks
                        );
                        return (
                          <tr key={result.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {result.marks_obtained} / {result.max_marks}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${gradeInfo.color} bg-opacity-10`}
                              >
                                {gradeInfo.grade}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {result.remarks || "-"}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    : // Teacher/Admin view - show all students
                      students.map((student) => {
                        const studentResult = results[student.id] || {};
                        const marks = studentResult.marks_obtained;
                        const gradeInfo =
                          marks !== undefined && selectedSchedule
                            ? calculateGrade(marks, selectedSchedule.max_marks)
                            : null;

                        return (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.roll_number || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {student.first_name} {student.last_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.admission_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                value={marks || ""}
                                onChange={(e) =>
                                  handleMarksChange(student.id, e.target.value)
                                }
                                min="0"
                                max={selectedSchedule?.max_marks}
                                step="0.01"
                                className="input w-24"
                                placeholder="0"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {gradeInfo && (
                                <span
                                  className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${gradeInfo.color} bg-opacity-10`}
                                >
                                  {gradeInfo.grade}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                value={studentResult.remarks || ""}
                                onChange={(e) =>
                                  handleRemarksChange(
                                    student.id,
                                    e.target.value
                                  )
                                }
                                className="input w-full"
                                placeholder="Optional remarks..."
                              />
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!selectedSubject && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <p className="text-blue-900 font-medium">
            Please select a subject to start entering results
          </p>
        </div>
      )}
    </div>
  );
};

export default ExamResults;
