import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Megaphone,
  AlertCircle,
  Info,
  User,
  Users,
} from "lucide-react";
import { announcementsAPI } from "../lib/api";
import Modal from "../components/common/Modal";
import AnnouncementForm from "../components/common/AnnouncementForm";
import toast from "react-hot-toast";
import PermissionGuard from "../components/common/PermissionGuard";
import { PERMISSIONS } from "../utils/rbac";

const AnnouncementDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch announcement details
  const { data: announcementData, isLoading } = useQuery({
    queryKey: ["announcement", id],
    queryFn: () => announcementsAPI.getById(id),
  });

  const announcement = announcementData?.data;

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => announcementsAPI.update(id, data),
    onSuccess: () => {
      toast.success("Announcement updated successfully");
      setIsEditModalOpen(false);
      queryClient.invalidateQueries(["announcement", id]);
      queryClient.invalidateQueries(["announcements"]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update announcement");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => announcementsAPI.delete(id),
    onSuccess: () => {
      toast.success("Announcement deleted successfully");
      navigate("/announcements");
      queryClient.invalidateQueries(["announcements"]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete announcement");
    },
  });

  const handleUpdate = (formData) => {
    updateMutation.mutate(formData);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "high":
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case "medium":
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      medium: "bg-blue-100 text-blue-800",
      low: "bg-gray-100 text-gray-800",
    };
    return colors[priority] || colors.low;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading"></div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="text-center py-12">
        <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Announcement not found</p>
        <button
          onClick={() => navigate("/announcements")}
          className="btn btn-primary mt-4"
        >
          Back to Announcements
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/announcements")}
            className="btn btn-outline flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Announcement Details
            </h1>
            <p className="text-gray-600 mt-1">View announcement information</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <PermissionGuard permission={PERMISSIONS.EDIT_ANNOUNCEMENTS}>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </PermissionGuard>
          <PermissionGuard permission={PERMISSIONS.DELETE_ANNOUNCEMENTS}>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="btn btn-danger flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-3">
        <div
          className={`inline-flex items-center px-4 py-2 rounded-lg font-medium ${getPriorityColor(
            announcement.priority
          )}`}
        >
          {getPriorityIcon(announcement.priority)}
          <span className="ml-2 capitalize">
            {announcement.priority} Priority
          </span>
        </div>
        <div className="inline-flex items-center px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-800">
          <Users className="w-4 h-4 mr-2" />
          <span className="capitalize">
            Target: {announcement.target_audience.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Announcement Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Content */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {announcement.title}
            </h2>

            <div className="mt-4">
              <p className="text-gray-700 whitespace-pre-wrap">
                {announcement.content}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar - Info */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Details</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Published Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(announcement.published_at).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>

              {announcement.expires_at && (
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Expires On</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(announcement.expires_at).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Created By</p>
                  <p className="font-semibold text-gray-900">
                    {announcement.created_by_name ||
                      `User ID: ${announcement.created_by}`}
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
                  {new Date(announcement.published_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(announcement.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Announcement"
        size="lg"
      >
        <AnnouncementForm
          announcement={announcement}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
          isSubmitting={updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Announcement"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this announcement? This action
            cannot be undone.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-medium">
              {announcement.title}
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
              {deleteMutation.isPending ? "Deleting..." : "Delete Announcement"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AnnouncementDetails;
