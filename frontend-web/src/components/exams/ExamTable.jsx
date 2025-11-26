import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit,
  Trash2,
  Eye,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle,
} from "lucide-react";
import { examsAPI } from "../../lib/api";
import Modal from "../common/Modal";
import ExamForm from "../common/ExamForm";
import PermissionGuard from "../common/PermissionGuard";
import { PERMISSIONS } from "../../utils/rbac";
import toast from "react-hot-toast";

const ExamTable = ({ exams, isLoading, onRefetch }) => {
  const navigate = useNavigate();
  const [editExam, setEditExam] = useState(null);
  const [deleteExam, setDeleteExam] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEdit = (exam) => {
    setEditExam(exam);
    setShowEditModal(true);
  };

  const handleDelete = (exam) => {
    setDeleteExam(exam);
    setShowDeleteModal(true);
  };

  const handleUpdateExam = async (formData) => {
    try {
      await examsAPI.update(editExam.id, formData);
      toast.success("Exam updated successfully!");
      setShowEditModal(false);
      setEditExam(null);
      onRefetch();
    } catch (error) {
      toast.error(error.message || "Failed to update exam");
    }
  };

  const confirmDelete = async () => {
    try {
      await examsAPI.delete(deleteExam.id);
      toast.success("Exam deleted successfully!");
      setShowDeleteModal(false);
      setDeleteExam(null);
      onRefetch();
    } catch (error) {
      toast.error(error.message || "Failed to delete exam");
    }
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const startDate = new Date(exam.start_date);
    const endDate = new Date(exam.end_date);

    if (now < startDate)
      return {
        status: "upcoming",
        color: "bg-purple-100 text-purple-800",
        icon: Calendar,
      };
    if (now >= startDate && now <= endDate)
      return {
        status: "ongoing",
        color: "bg-orange-100 text-orange-800",
        icon: TrendingUp,
      };
    if (now > endDate)
      return {
        status: "completed",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      };
    return {
      status: "unknown",
      color: "bg-gray-100 text-gray-800",
      icon: Calendar,
    };
  };

  const getExamTypeColor = (type) => {
    const colors = {
      term: "bg-blue-100 text-blue-800 border-blue-200",
      midterm: "bg-purple-100 text-purple-800 border-purple-200",
      final: "bg-red-100 text-red-800 border-red-200",
      unit_test: "bg-green-100 text-green-800 border-green-200",
      monthly: "bg-yellow-100 text-yellow-800 border-yellow-200",
      quarterly: "bg-orange-100 text-orange-800 border-orange-200",
      annual: "bg-pink-100 text-pink-800 border-pink-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDuration = (exam) => {
    const start = new Date(exam.start_date);
    const end = new Date(exam.end_date);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!exams || exams.length === 0) {
    return (
      <div className="card text-center py-16">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Exams Found
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first exam to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Exam Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Marks
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exams.map((exam) => {
                const examStatus = getExamStatus(exam);
                const StatusIcon = examStatus.icon;

                return (
                  <tr
                    key={exam.id}
                    className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
                    onClick={() => navigate(`/exams/${exam.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-lg">
                              {exam.name?.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {exam.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {exam.academic_year}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1.5 inline-flex text-xs font-medium rounded-full border ${getExamTypeColor(
                          exam.exam_type
                        )}`}
                      >
                        {exam.exam_type.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {exam.class_name || `Class ${exam.class_id}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                          {formatDate(exam.start_date)}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="mr-1.5">→</span>
                          {formatDate(exam.end_date)}
                        </div>
                        <div className="text-xs text-blue-600 font-medium">
                          {calculateDuration(exam)}{" "}
                          {calculateDuration(exam) === 1 ? "day" : "days"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-gray-900">
                          {exam.total_marks} marks
                        </div>
                        <div className="text-xs text-gray-500">
                          Pass: {exam.passing_marks} (
                          {(
                            (exam.passing_marks / exam.total_marks) *
                            100
                          ).toFixed(0)}
                          %)
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={`px-3 py-1.5 inline-flex items-center text-xs font-semibold rounded-full capitalize ${examStatus.color}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                          {examStatus.status}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => navigate(`/exams/${exam.id}`)}
                          className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <PermissionGuard permission={PERMISSIONS.UPDATE_EXAM}>
                          <button
                            onClick={() => handleEdit(exam)}
                            className="text-green-600 hover:text-green-900 hover:bg-green-50 p-2 rounded-lg transition-colors"
                            title="Edit Exam"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        </PermissionGuard>
                        <PermissionGuard permission={PERMISSIONS.DELETE_EXAM}>
                          <button
                            onClick={() => handleDelete(exam)}
                            className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            title="Delete Exam"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Exam"
        size="lg"
      >
        <ExamForm
          exam={editExam}
          onSubmit={handleUpdateExam}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Exam"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                Are you sure you want to delete this exam?
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                You are about to delete{" "}
                <span className="font-semibold">{deleteExam?.name}</span>. This
                action cannot be undone.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                <p className="text-xs text-yellow-800">
                  ⚠️ All exam schedules, results, and related data will be
                  permanently removed.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Exam</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ExamTable;
