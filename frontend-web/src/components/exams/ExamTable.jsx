import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit,
  Trash2,
  Eye,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle,
  BookOpen,
  Clock,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { examsAPI } from "../../lib/api";
import Modal from "../common/Modal";
import ExamForm from "../common/ExamForm";
import PermissionGuard from "../common/PermissionGuard";
import { PERMISSIONS } from "../../utils/rbac";
import toast from "react-hot-toast";

const ExamTable = ({ exams, isLoading, onRefetch }) => {
  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = useState(null);
  const [editExam, setEditExam] = useState(null);
  const [deleteExam, setDeleteExam] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Select the first exam by default when data loads
  useEffect(() => {
    if (exams && exams.length > 0 && !selectedExam) {
      setSelectedExam(exams[0]);
    } else if (!exams || exams.length === 0) {
      setSelectedExam(null);
    }
  }, [exams, selectedExam]);

  const handleExamClick = (exam) => {
    setSelectedExam(exam);
  };

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

      // Update selected exam if it was the one edited
      if (selectedExam && selectedExam.id === editExam.id) {
        setSelectedExam({ ...selectedExam, ...formData });
      }
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

      if (selectedExam && selectedExam.id === deleteExam.id) {
        setSelectedExam(null);
      }

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
        color: "bg-white text-black",
        borderColor: "border-blue-600",
        icon: Calendar,
      };
    if (now >= startDate && now <= endDate)
      return {
        status: "ongoing",
        color: "bg-blue-600 text-white",
        borderColor: "border-blue-600",
        icon: TrendingUp,
      };
    if (now > endDate)
      return {
        status: "completed",
        color: "bg-white text-black",
        borderColor: "border-gray-200",
        icon: CheckCircle,
      };
    return {
      status: "unknown",
      color: "bg-white text-black",
      borderColor: "border-gray-200",
      icon: Calendar,
    };
  };

  const getExamTypeColor = (type) => {
    const colors = {
      term: "bg-white text-black border-blue-200",
      midterm: "bg-white text-black border-blue-200",
      final: "bg-white text-black border-blue-200",
      unit_test: "bg-white text-black border-blue-200",
      monthly: "bg-white text-black border-blue-200",
      quarterly: "bg-white text-black border-blue-200",
      annual: "bg-white text-black border-blue-200",
    };
    return colors[type] || "bg-white text-black border-gray-200";
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
      <div className="flex h-screen bg-gray-50">
        <div className="w-80 bg-white border-r border-gray-200 p-4">
          <div className="animate-pulse space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-40 bg-gray-200 rounded"></div>
              <div className="h-40 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!exams || exams.length === 0) {
    return (
      <div className="flex h-[calc(100vh-200px)] bg-gray-50 items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <BookOpen className="w-10 h-10 text-gray-400" />
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
      <div className="flex h-[calc(100vh-200px)] bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Sidebar - Exam List */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10 backdrop-blur-sm">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Exam List ({exams.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-50">
            {exams.map((exam) => {
              const status = getExamStatus(exam);
              return (
                <div
                  key={exam.id}
                  onClick={() => handleExamClick(exam)}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${selectedExam?.id === exam.id
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : "border-l-4 border-transparent"
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedExam?.id === exam.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                      <span className="font-bold text-sm">{exam.name?.charAt(0)}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${selectedExam?.id === exam.id ? 'text-blue-700' : 'text-gray-900'
                        }`}>
                        {exam.name}
                      </div>
                      <div className="flex items-center text-xs text-black mt-0.5">
                        <span className={`w-2 h-2 rounded-full mr-1 ${status.status === 'ongoing' ? 'bg-blue-600' : 'bg-black'}`}></span>
                        <span className="capitalize">{status.status}</span>
                      </div>
                    </div>

                    {selectedExam?.id === exam.id && (
                      <ChevronRight className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content - Exam Details */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {selectedExam ? (
            <div className="relative">
              {/* Header Banner */}
              <div className="h-32 bg-blue-600"></div>

              <div className="px-8 pb-8">
                <div className="relative flex items-end -mt-12 mb-6 space-x-5">
                  <div className="w-32 h-32 rounded-xl bg-white p-1 shadow-lg">
                    <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                      <BookOpen className="w-12 h-12 text-blue-500" />
                    </div>
                  </div>

                  <div className="flex-1 pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                          {selectedExam.name}
                        </h1>
                        <p className="text-gray-600 flex items-center space-x-2 mt-1">
                          <span className="font-medium text-gray-900">{selectedExam.academic_year}</span>
                          <span className="text-gray-300">•</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getExamTypeColor(selectedExam.exam_type)}`}>
                            {selectedExam.exam_type.replace("_", " ").toUpperCase()}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {(() => {
                          const status = getExamStatus(selectedExam);
                          const StatusIcon = status.icon;
                          return (
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center ${status.color} ${status.borderColor}`}>
                              <StatusIcon className="w-4 h-4 mr-1.5" />
                              <span className="capitalize">{status.status}</span>
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
                  <div className="flex space-x-8">
                    <button className="text-blue-600 font-medium border-b-2 border-blue-600 pb-6 -mb-6.5">
                      Overview
                    </button>
                    <button
                      onClick={() => navigate(`/exams/${selectedExam.id}`)}
                      className="text-gray-500 hover:text-gray-800 font-medium pb-6 -mb-6.5 transition-colors"
                    >
                      View Details
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <PermissionGuard permission={PERMISSIONS.UPDATE_EXAM}>
                      <button
                        onClick={() => handleEdit(selectedExam)}
                        className="btn btn-sm btn-outline flex items-center space-x-1"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    </PermissionGuard>
                    <PermissionGuard permission={PERMISSIONS.DELETE_EXAM}>
                      <button
                        onClick={() => handleDelete(selectedExam)}
                        className="btn btn-sm text-black hover:bg-gray-100 border border-black hover:border-black flex items-center space-x-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </PermissionGuard>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Schedule Info */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                      Schedule Information
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Start Date</p>
                          <p className="text-gray-900 mt-1">{formatDate(selectedExam.start_date)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">End Date</p>
                          <p className="text-gray-900 mt-1">{formatDate(selectedExam.end_date)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</p>
                        <p className="text-gray-900 mt-1 flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          {calculateDuration(selectedExam)} Days
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Exam Details */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 text-gray-400" />
                      Exam Details
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Class</p>
                        <p className="text-gray-900 mt-1 flex items-center">
                          <Users className="w-4 h-4 mr-1 text-gray-400" />
                          {selectedExam.class_name || `Class ${selectedExam.class_id}`}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Marks</p>
                          <p className="text-gray-900 mt-1 font-semibold">{selectedExam.total_marks}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pass Marks</p>
                          <p className="text-gray-900 mt-1 text-black">{selectedExam.passing_marks}</p>
                        </div>
                      </div>

                      <div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                          <div
                            className="bg-black h-1.5 rounded-full"
                            style={{ width: `${(selectedExam.passing_marks / selectedExam.total_marks) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-right">
                          Pass requires {((selectedExam.passing_marks / selectedExam.total_marks) * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedExam.description && (
                    <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                      <h3 className="text-base font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-600 text-sm">{selectedExam.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No Exam Selected</h3>
              <p className="text-gray-500 max-w-sm mt-2">
                Select an exam from the list to view its details, schedule, and performance metrics.
              </p>
            </div>
          )}
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
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-blue-600" />
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
              <div className="bg-white border border-gray-200 rounded-lg p-3 mt-3">
                <p className="text-xs text-black">
                  ⚠️ All exam schedules, results, and related data will be
                  permanently removed.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
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
