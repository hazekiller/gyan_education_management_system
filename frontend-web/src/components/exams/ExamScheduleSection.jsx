import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Award,
  Target,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { examScheduleAPI } from "../../lib/api";
import ExamScheduleModal from "./ExamScheduleModal";
import toast from "react-hot-toast";
import PermissionGuard from "../common/PermissionGuard";
import { PERMISSIONS } from "../../utils/rbac";

const ExamScheduleSection = ({ examId, examData }) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [deleteSchedule, setDeleteSchedule] = useState(null);

  // Fetch exam schedules
  const { data: schedulesData, isLoading } = useQuery({
    queryKey: ["exam-schedules", examId],
    queryFn: () => examScheduleAPI.getExamSchedules(examId),
    enabled: !!examId,
  });

  const schedules = schedulesData?.data || [];

  // Create schedule mutation
  const createMutation = useMutation({
    mutationFn: (data) => examScheduleAPI.create({ ...data, exam_id: examId }),
    onSuccess: () => {
      toast.success("Schedule added successfully");
      setIsModalOpen(false);
      queryClient.invalidateQueries(["exam-schedules", examId]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add schedule");
    },
  });

  // Update schedule mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => examScheduleAPI.update(id, data),
    onSuccess: () => {
      toast.success("Schedule updated successfully");
      setIsModalOpen(false);
      setEditingSchedule(null);
      queryClient.invalidateQueries(["exam-schedules", examId]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update schedule");
    },
  });

  // Delete schedule mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => examScheduleAPI.delete(id),
    onSuccess: () => {
      toast.success("Schedule deleted successfully");
      setDeleteSchedule(null);
      queryClient.invalidateQueries(["exam-schedules", examId]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete schedule");
    },
  });

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleSubmit = (formData) => {
    if (editingSchedule) {
      updateMutation.mutate({
        id: editingSchedule.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteSchedule) {
      deleteMutation.mutate(deleteSchedule.id);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "";
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diff = (end - start) / (1000 * 60); // minutes
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}h ${minutes}m`;
  };

  // Group schedules by date
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const date = schedule.exam_date?.split("T")[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(schedule);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-blue-600" />
          Exam Schedule
        </h3>
        <button
          onClick={handleAddSchedule}
          className="btn btn-primary flex items-center space-x-2 shadow-md hover:shadow-lg transition-shadow"
        >
          <Plus className="w-5 h-5" />
          <span>Add Schedule</span>
        </button>
      </div>

      {/* Schedule List */}
      {schedules.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            No Schedule Added
          </h4>
          <p className="text-gray-500 mb-6">
            Create your first exam schedule to get started
          </p>
          <button onClick={handleAddSchedule} className="btn btn-primary">
            <Plus className="w-5 h-5 inline mr-2" />
            Add First Schedule
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSchedules).map(([date, dateSchedules]) => (
            <div key={date} className="border-l-4 border-blue-500 pl-4">
              {/* Date Header */}
              <div className="flex items-center mb-3">
                <div className="bg-blue-100 rounded-lg px-4 py-2">
                  <p className="text-sm font-semibold text-blue-900">
                    {formatDate(date)}
                  </p>
                </div>
              </div>

              {/* Schedules for this date */}
              <div className="space-y-3">
                {dateSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      {/* Schedule Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          {/* Subject */}
                          <div className="flex items-center">
                            <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="font-semibold text-gray-900 text-lg">
                              {schedule.subject_name}
                            </span>
                            {schedule.subject_code && (
                              <span className="ml-2 text-sm text-gray-500">
                                ({schedule.subject_code})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Time */}
                          <div className="flex items-center text-sm">
                            <Clock className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <p className="text-gray-600">Time</p>
                              <p className="font-medium text-gray-900">
                                {formatTime(schedule.start_time)} -{" "}
                                {formatTime(schedule.end_time)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {calculateDuration(
                                  schedule.start_time,
                                  schedule.end_time
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Room */}
                          {schedule.room_number && (
                            <div className="flex items-center text-sm">
                              <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                              <div>
                                <p className="text-gray-600">Room</p>
                                <p className="font-medium text-gray-900">
                                  {schedule.room_number}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Max Marks */}
                          <div className="flex items-center text-sm">
                            <Award className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <p className="text-gray-600">Max Marks</p>
                              <p className="font-medium text-gray-900">
                                {schedule.max_marks}
                              </p>
                            </div>
                          </div>

                          {/* Passing Marks */}
                          <div className="flex items-center text-sm">
                            <Target className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <p className="text-gray-600">Passing Marks</p>
                              <p className="font-medium text-gray-900">
                                {schedule.passing_marks} (
                                {(
                                  (schedule.passing_marks /
                                    schedule.max_marks) *
                                  100
                                ).toFixed(0)}
                                %)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <PermissionGuard permission={PERMISSIONS.EDIT_EXAMS}>
                          <button
                            onClick={() => handleEditSchedule(schedule)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Schedule"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        </PermissionGuard>
                        <PermissionGuard permission={PERMISSIONS.DELETE_EXAMS}>
                          <button
                            onClick={() => setDeleteSchedule(schedule)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Schedule"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </PermissionGuard>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <ExamScheduleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSchedule(null);
        }}
        onSubmit={handleSubmit}
        schedule={editingSchedule}
        examData={examData}
      />

      {/* Delete Confirmation Modal */}
      {deleteSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Delete Schedule
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete the schedule for{" "}
                  <span className="font-semibold">
                    {deleteSchedule.subject_name}
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setDeleteSchedule(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamScheduleSection;
