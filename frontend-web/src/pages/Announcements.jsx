import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Megaphone, AlertCircle, Info, Edit, Trash2, Clock, User } from "lucide-react";
import { announcementsAPI } from "../lib/api";
import Modal from "../components/common/Modal";
import AnnouncementForm from "../components/common/AnnouncementForm";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import PermissionGuard from "../components/common/PermissionGuard";
import { PERMISSIONS } from "../utils/rbac";

const Announcements = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const { data: announcementsData, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: announcementsAPI.getAll,
  });

  const announcements = announcementsData?.data || [];

  // Create announcement mutation
  const createMutation = useMutation({
    mutationFn: announcementsAPI.create,
    onSuccess: () => {
      toast.success("Announcement published successfully");
      setIsModalOpen(false);
      queryClient.invalidateQueries(["announcements"]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to publish announcement");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) =>
      announcementsAPI.update(selectedAnnouncement.id, data),
    onSuccess: () => {
      toast.success("Announcement updated successfully");
      setIsEditModalOpen(false);
      setSelectedAnnouncement(null);
      queryClient.invalidateQueries(["announcements"]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update announcement");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => announcementsAPI.delete(selectedAnnouncement.id),
    onSuccess: () => {
      toast.success("Announcement deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedAnnouncement(null);
      queryClient.invalidateQueries(["announcements"]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete announcement");
    },
  });

  const handleSubmit = (formData) => {
    createMutation.mutate(formData);
  };

  const handleUpdate = (formData) => {
    updateMutation.mutate(formData);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const openEditModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDeleteModalOpen(true);
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
      urgent: "border-red-500 bg-red-50",
      high: "border-orange-500 bg-orange-50",
      medium: "border-blue-500 bg-blue-50",
      low: "border-gray-500 bg-gray-50",
    };
    return colors[priority] || colors.low;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Megaphone className="w-6 h-6 text-blue-600" />
              </div>
              Announcements
            </h1>
            <p className="text-gray-500 mt-1 ml-12">
              Stay updated with the latest news, notices, and important alerts.
            </p>
          </div>
          <PermissionGuard permissions={[PERMISSIONS.CREATE_ANNOUNCEMENTS]}>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-200 flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">New Announcement</span>
            </button>
          </PermissionGuard>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Notices</p>
              <h3 className="text-2xl font-bold text-gray-900">{announcements.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <Megaphone className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-red-200 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Urgent</p>
              <h3 className="text-2xl font-bold text-red-600">
                {announcements.filter((a) => a.priority === "urgent").length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-orange-200 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">High Priority</p>
              <h3 className="text-2xl font-bold text-orange-600">
                {announcements.filter((a) => a.priority === "high").length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
              <Info className="w-5 h-5 text-orange-500" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">General</p>
              <h3 className="text-2xl font-bold text-blue-600">
                {announcements.filter((a) => a.target_audience === "all").length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Announcements List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Loading announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100 text-center px-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Megaphone className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Announcements Yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">
              There are currently no active announcements.
              {PERMISSIONS.CREATE_ANNOUNCEMENTS && " Create one to get started."}
            </p>
            <PermissionGuard permissions={[PERMISSIONS.CREATE_ANNOUNCEMENTS]}>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary bg-blue-600 text-white rounded-xl px-6"
              >
                Publish First Announcement
              </button>
            </PermissionGuard>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden relative"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getPriorityColor(announcement.priority).split(" ")[1].replace('bg-', 'bg-')}`}></div>

                <div className="p-6 flex flex-col md:flex-row gap-6">
                  {/* Icon/Date Column */}
                  <div className="flex md:flex-col items-center md:items-start gap-3 min-w-[120px]">
                    <div className={`
                         w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border
                         ${announcement.priority === "urgent" ? 'bg-red-50 border-red-100' :
                        announcement.priority === "high" ? 'bg-orange-50 border-orange-100' :
                          announcement.priority === "medium" ? 'bg-blue-50 border-blue-100' :
                            'bg-gray-50 border-gray-100'}
                       `}>
                      {getPriorityIcon(announcement.priority)}
                    </div>
                    <div className="text-sm">
                      <p className="font-bold text-gray-900">
                        {new Date(announcement.published_at).toLocaleDateString('en-US', { disable: 'long', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(announcement.published_at).getFullYear()}
                      </p>
                    </div>
                  </div>

                  {/* Content Column */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3
                        className="text-xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                        onClick={() => navigate(`/announcements/${announcement.id}`)}
                      >
                        {announcement.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <PermissionGuard permission={PERMISSIONS.EDIT_ANNOUNCEMENTS}>
                            <button
                              onClick={(e) => { e.stopPropagation(); openEditModal(announcement); }}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </PermissionGuard>
                          <PermissionGuard permission={PERMISSIONS.DELETE_ANNOUNCEMENTS}>
                            <button
                              onClick={(e) => { e.stopPropagation(); openDeleteModal(announcement); }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </PermissionGuard>
                        </div>
                        <span className={`
                                px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide
                                ${announcement.priority === "urgent" ? 'bg-red-100 text-red-700' :
                            announcement.priority === "high" ? 'bg-orange-100 text-orange-700' :
                              announcement.priority === "medium" ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'}
                             `}>
                          {announcement.priority}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {announcement.content}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500 border-t border-gray-50 pt-3">
                      <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className="capitalize">{announcement.target_audience.replace('_', ' ')}</span>
                      </div>
                      {announcement.expires_at && (
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded text-orange-600 bg-orange-50/50">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Expires: {new Date(announcement.expires_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Announcement"
        >
          <AnnouncementForm
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
            isSubmitting={createMutation.isPending}
          />
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedAnnouncement(null);
          }}
          title="Edit Announcement"
        >
          {selectedAnnouncement && (
            <AnnouncementForm
              announcement={selectedAnnouncement}
              onSubmit={handleUpdate}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedAnnouncement(null);
              }}
              isSubmitting={updateMutation.isPending}
            />
          )}
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedAnnouncement(null);
          }}
          title="Delete Announcement"
          size="sm"
        >
          <div className="bg-red-50 p-4 rounded-xl mb-4 border border-red-100 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-900">Confirm Deletion</h4>
              <p className="text-sm text-red-700 mt-1">
                Are you sure you want to delete this announcement? This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedAnnouncement(null);
              }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-lg shadow-red-200"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Announcement"}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Announcements;
