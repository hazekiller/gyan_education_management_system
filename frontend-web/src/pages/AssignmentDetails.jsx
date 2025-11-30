import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Edit,
  Trash2,
  Download,
  User,
  BookOpen,
  Award,
  Send,
  CheckCircle,
  Users,
} from "lucide-react";
import { assignmentsAPI } from "../lib/api";
import { useSelector } from "react-redux";
import { selectUserRole } from "../store/slices/authSlice";
import Modal from "../components/common/Modal";
import AssignmentForm from "../components/common/AssignmentForm";
import toast from "react-hot-toast";

const AssignmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userRole = useSelector(selectUserRole);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch assignment details
  const { data: assignmentData, isLoading } = useQuery({
    queryKey: ["assignment", id],
    queryFn: () => assignmentsAPI.getById(id),
  });

  const assignment = assignmentData?.data;

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => assignmentsAPI.update(id, data),
    onSuccess: () => {
      toast.success("Assignment updated successfully");
      setIsEditModalOpen(false);
      queryClient.invalidateQueries(["assignment", id]);
      queryClient.invalidateQueries(["assignments"]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update assignment");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => assignmentsAPI.delete(id),
    onSuccess: () => {
      toast.success("Assignment deleted successfully");
      navigate("/assignments");
      queryClient.invalidateQueries(["assignments"]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete assignment");
    },
  });

  const handleUpdate = (formData) => {
    updateMutation.mutate(formData);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const getStatusColor = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return "bg-red-100 text-red-800";
    if (daysUntilDue <= 3) return "bg-orange-100 text-orange-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return `${Math.abs(daysUntilDue)} days overdue`;
    if (daysUntilDue === 0) return "Due today";
    if (daysUntilDue === 1) return "Due tomorrow";
    return `${daysUntilDue} days remaining`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Assignment not found</p>
        <button
          onClick={() => navigate("/assignments")}
          className="btn btn-primary mt-4"
        >
          Back to Assignments
        </button>
      </div>
    );
  }

  const canEdit =
    userRole === "super_admin" ||
    userRole === "admin" ||
    userRole === "teacher";
  const canDelete = userRole === "super_admin" || userRole === "admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/assignments")}
            className="btn btn-outline flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Assignment Details
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage assignment information
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {canEdit && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="btn btn-danger flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div
        className={`inline-flex items-center px-4 py-2 rounded-lg font-medium ${getStatusColor(
          assignment.due_date
        )}`}
      >
        <Clock className="w-4 h-4 mr-2" />
        {getStatusText(assignment.due_date)}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Description */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {assignment.title}
            </h2>

            {assignment.description && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Instructions
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {assignment.description}
                </p>
              </div>
            )}
          </div>

          {/* Attachments */}
          {assignment.attachments && assignment.attachments.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Attachments ({assignment.attachments.length})
              </h3>
              <div className="space-y-2">
                {assignment.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-700">
                        {attachment.split("/").pop()}
                      </span>
                    </div>
                    <a
                      href={`${import.meta.env.VITE_API_URL?.replace(
                        "/api",
                        ""
                      )}/${attachment}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline flex items-center space-x-1"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Assignment Info */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Assignment Info
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(assignment.due_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Award className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Total Marks</p>
                  <p className="font-semibold text-gray-900">
                    {assignment.total_marks}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <BookOpen className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Class & Section</p>
                  <p className="font-semibold text-gray-900">
                    {assignment.class_name} - {assignment.section_name}
                  </p>
                </div>
              </div>

              {assignment.subject_name && (
                <div className="flex items-start space-x-3">
                  <BookOpen className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Subject</p>
                    <p className="font-semibold text-gray-900">
                      {assignment.subject_name}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Created By</p>
                  <p className="font-semibold text-gray-900">
                    Teacher ID: {assignment.created_by}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(assignment.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(assignment.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Section */}
      <SubmissionsSection
        assignmentId={id}
        assignment={assignment}
        userRole={userRole}
      />

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Assignment"
        size="lg"
      >
        <AssignmentForm
          assignment={assignment}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
          isSubmitting={updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Assignment"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this assignment? This action cannot
            be undone.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-medium">
              {assignment.title}
            </p>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="btn btn-outline"
              disabled={deleteMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-danger"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Assignment"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ==========================================
// SUBMISSION COMPONENTS
// ==========================================

// Submissions Section Component
const SubmissionsSection = ({ assignmentId, assignment, userRole }) => {
  const queryClient = useQueryClient();
  const isStudent = userRole === "student";
  const isTeacherOrAdmin = ["teacher", "admin", "super_admin"].includes(
    userRole
  );

  // Fetch student's own submission
  const { data: mySubmissionData } = useQuery({
    queryKey: ["my-submission", assignmentId],
    queryFn: () => assignmentsAPI.getMySubmission(assignmentId),
    enabled: isStudent,
  });

  // Fetch all submissions (for teachers/admins)
  const { data: submissionsData } = useQuery({
    queryKey: ["submissions", assignmentId],
    queryFn: () => assignmentsAPI.getSubmissions(assignmentId),
    enabled: isTeacherOrAdmin,
  });

  const mySubmission = mySubmissionData?.data;
  const submissions = submissionsData?.data || [];

  if (isStudent) {
    return (
      <StudentSubmissionView
        submission={mySubmission}
        assignment={assignment}
        assignmentId={assignmentId}
        queryClient={queryClient}
      />
    );
  }

  if (isTeacherOrAdmin) {
    return (
      <TeacherSubmissionsView
        submissions={submissions}
        assignment={assignment}
        queryClient={queryClient}
      />
    );
  }

  return null;
};

// Student Submission View
const StudentSubmissionView = ({
  submission,
  assignment,
  assignmentId,
  queryClient,
}) => {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    submission_text: "",
    attachments: null,
  });

  const submitMutation = useMutation({
    mutationFn: (data) => assignmentsAPI.submit(assignmentId, data),
    onSuccess: () => {
      toast.success("Assignment submitted successfully");
      queryClient.invalidateQueries(["my-submission", assignmentId]);
      setFormData({ submission_text: "", attachments: null });
      setIsSubmitModalOpen(false);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to submit assignment"
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  if (submission) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
          Your Submission
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div>
              <p className="font-semibold text-green-800">
                Status: {submission.status}
              </p>
              <p className="text-sm text-green-600">
                Submitted on{" "}
                {new Date(submission.submitted_at).toLocaleString()}
              </p>
            </div>
            {submission.status === "graded" && (
              <div className="text-right">
                <p className="text-2xl font-bold text-green-800">
                  {submission.marks_obtained}/{assignment.total_marks}
                </p>
                <p className="text-sm text-green-600">Marks</p>
              </div>
            )}
          </div>

          {submission.submission_text && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Your Answer:</h4>
              <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {submission.submission_text}
              </p>
            </div>
          )}

          {submission.attachments && submission.attachments.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Attachments:</h4>
              <div className="space-y-2">
                {submission.attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm">{file.split("/").pop()}</span>
                    <a
                      href={`${import.meta.env.VITE_API_URL?.replace(
                        "/api",
                        ""
                      )}/${file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {submission.feedback && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                Teacher's Feedback:
              </h4>
              <p className="text-blue-800">{submission.feedback}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Send className="w-6 h-6 mr-2 text-blue-600" />
          Assignment Submission
        </h3>
        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Send className="w-4 h-4" />
          <span>Submit Assignment</span>
        </button>
      </div>

      <p className="text-gray-600">
        Click the "Submit Assignment" button to submit your work for this
        assignment.
      </p>

      {/* Submission Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Assignment"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer
            </label>
            <textarea
              value={formData.submission_text}
              onChange={(e) =>
                setFormData({ ...formData, submission_text: e.target.value })
              }
              className="input min-h-[200px]"
              placeholder="Type your answer here..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (Optional)
            </label>
            <input
              type="file"
              onChange={(e) =>
                setFormData({ ...formData, attachments: e.target.files })
              }
              className="input"
              multiple
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Max 5 files (PDF, DOC, DOCX, PNG, JPG)
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Assignment"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// Teacher Submissions View
const TeacherSubmissionsView = ({ submissions, assignment, queryClient }) => {
  const [gradingSubmission, setGradingSubmission] = useState(null);

  const gradeMutation = useMutation({
    mutationFn: ({ submissionId, data }) =>
      assignmentsAPI.gradeSubmission(submissionId, data),
    onSuccess: () => {
      toast.success("Submission graded successfully");
      queryClient.invalidateQueries(["submissions"]);
      setGradingSubmission(null);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to grade submission"
      );
    },
  });

  const handleGrade = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    gradeMutation.mutate({
      submissionId: gradingSubmission.id,
      data: {
        marks_obtained: parseFloat(formData.get("marks")),
        feedback: formData.get("feedback"),
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <Users className="w-6 h-6 mr-2 text-blue-600" />
        Student Submissions ({submissions.length})
      </h3>

      {submissions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No submissions yet</p>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {sub.first_name} {sub.last_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Roll: {sub.roll_number} | Admission: {sub.admission_number}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    sub.status === "graded"
                      ? "bg-green-100 text-green-800"
                      : sub.status === "late"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {sub.status}
                </span>
              </div>

              {sub.submission_text && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Answer:
                  </p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {sub.submission_text}
                  </p>
                </div>
              )}

              {sub.attachments && sub.attachments.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Attachments:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sub.attachments.map((file, idx) => (
                      <a
                        key={idx}
                        href={`${import.meta.env.VITE_API_URL?.replace(
                          "/api",
                          ""
                        )}/${file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs btn btn-sm btn-outline"
                      >
                        {file.split("/").pop()}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {sub.status === "graded" ? (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm font-semibold text-green-800">
                    Marks: {sub.marks_obtained}/{assignment.total_marks}
                  </p>
                  {sub.feedback && (
                    <p className="text-sm text-green-700 mt-1">
                      Feedback: {sub.feedback}
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setGradingSubmission(sub)}
                  className="btn btn-sm btn-primary mt-2"
                >
                  Grade Submission
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Grading Modal */}
      <Modal
        isOpen={!!gradingSubmission}
        onClose={() => setGradingSubmission(null)}
        title="Grade Submission"
      >
        {gradingSubmission && (
          <form onSubmit={handleGrade} className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Student: {gradingSubmission.first_name}{" "}
                {gradingSubmission.last_name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marks Obtained (out of {assignment.total_marks})
              </label>
              <input
                type="number"
                name="marks"
                className="input"
                min="0"
                max={assignment.total_marks}
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback
              </label>
              <textarea
                name="feedback"
                className="input min-h-[100px]"
                placeholder="Provide feedback to the student..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setGradingSubmission(null)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={gradeMutation.isPending}
              >
                {gradeMutation.isPending ? "Grading..." : "Submit Grade"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AssignmentDetails;
