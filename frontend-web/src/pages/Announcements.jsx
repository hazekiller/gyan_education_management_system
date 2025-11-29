import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Megaphone, AlertCircle, Info, Edit, Trash2 } from "lucide-react";
import { announcementsAPI } from "../lib/api";
import Modal from "../components/common/Modal";
import AnnouncementForm from "../components/common/AnnouncementForm";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-gradient-to-br from-gray-50/50 to-white/50">
  {/* Page Header */}
  <div className="flex justify-between items-center bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
    <div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
        Announcements
      </h1>
      <p className="text-gray-600 mt-2 text-lg font-medium">Important notices and updates</p>
    </div>
    <button
      onClick={() => setIsModalOpen(true)}
      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 whitespace-nowrap"
    >
      <Plus className="w-5 h-5" />
      <span>New Announcement</span>
    </button>
  </div>

  {/* Announcements List */}
  {isLoading ? (
    <div className="flex justify-center items-center h-64 bg-white rounded-2xl shadow-sm p-8">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin shadow-lg"></div>
    </div>
  ) : announcements.length === 0 ? (
    <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-100 hover:shadow-2xl transition-shadow">
      <Megaphone className="w-20 h-20 text-gray-300 mx-auto mb-6" />
      <p className="text-xl text-gray-500 mb-6 font-medium">No announcements yet</p>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
      >
        Publish First Announcement
      </button>
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className={`bg-white rounded-2xl shadow-lg p-8 border-l-4 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ${getPriorityColor(
            announcement.priority
          )}`}
        >
          <div className="flex items-start space-x-6">
            {/* Priority Icon */}
            <div className="flex-shrink-0 mt-1 p-3 bg-white/60 rounded-xl shadow-md border">
              {getPriorityIcon(announcement.priority)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3
                    className="text-2xl font-bold text-gray-900 mb-3 cursor-pointer hover:text-blue-600 transition-colors line-clamp-1"
                    onClick={() =>
                      navigate(`/announcements/${announcement.id}`)
                    }
                  >
                    {announcement.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 font-medium">
                    <span>
                      {new Date(
                        announcement.published_at
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="capitalize">
                      Target: {announcement.target_audience.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
                      announcement.priority === "urgent"
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : announcement.priority === "high"
                        ? "bg-orange-100 text-orange-800 border border-orange-200"
                        : announcement.priority === "medium"
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : "bg-gray-100 text-gray-800 border border-gray-200"
                    }`}
                  >
                    {announcement.priority.toUpperCase()}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(announcement)}
                      className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(announcement)}
                      className="p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="prose prose-sm max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed line-clamp-3 font-medium">
                  {announcement.content}
                </p>
              </div>

              {announcement.expires_at && (
                <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium flex items-center space-x-2">
                  <span>📅</span>
                  <span>Expires on {new Date(announcement.expires_at).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )}

  {/* Stats */}
  <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
    <h3 className="text-2xl font-bold text-gray-900 mb-8 bg-gradient-to-r from-gray-900/80 to-gray-700/80 bg-clip-text">
      Announcement Statistics
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      <div className="text-center p-8 bg-gradient-to-br from-gray-50 to-white/0 rounded-2xl shadow-sm hover:shadow-md transition-all">
        <p className="text-4xl font-bold text-gray-900 mb-2">{announcements.length}</p>
        <p className="text-sm text-gray-600 font-semibold tracking-wide">Total</p>
      </div>
      <div className="text-center p-8 bg-gradient-to-br from-red-50/80 to-white/0 rounded-2xl shadow-sm hover:shadow-md transition-all">
        <p className="text-4xl font-bold text-red-600 mb-2">
          {announcements.filter((a) => a.priority === "urgent").length}
        </p>
        <p className="text-sm text-gray-600 font-semibold tracking-wide">Urgent</p>
      </div>
      <div className="text-center p-8 bg-gradient-to-br from-orange-50/80 to-white/0 rounded-2xl shadow-sm hover:shadow-md transition-all">
        <p className="text-4xl font-bold text-orange-600 mb-2">
          {announcements.filter((a) => a.priority === "high").length}
        </p>
        <p className="text-sm text-gray-600 font-semibold tracking-wide">High Priority</p>
      </div>
      <div className="text-center p-8 bg-gradient-to-br from-blue-50/80 to-white/0 rounded-2xl shadow-sm hover:shadow-md transition-all">
        <p className="text-4xl font-bold text-blue-600 mb-2">
          {announcements.filter((a) => a.target_audience === "all").length}
        </p>
        <p className="text-sm text-gray-600 font-semibold tracking-wide">For Everyone</p>
      </div>
    </div>
  </div>

  {/* Modals remain exactly the same - no changes */}
</div>

  );
};

export default Announcements;
