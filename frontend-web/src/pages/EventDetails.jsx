import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { eventsAPI } from "../lib/api";
import Modal from "../components/common/Modal";
import EventForm from "../components/common/EventForm";
import toast from "react-hot-toast";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch event details
  const { data: eventData, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => eventsAPI.getById(id),
  });

  const event = eventData?.data;

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => eventsAPI.update(id, data),
    onSuccess: () => {
      toast.success("Event updated successfully");
      setIsEditModalOpen(false);
      queryClient.invalidateQueries(["event", id]);
      queryClient.invalidateQueries(["events"]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update event");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => eventsAPI.delete(id),
    onSuccess: () => {
      toast.success("Event deleted successfully");
      navigate("/events");
      queryClient.invalidateQueries(["events"]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete event");
    },
  });

  const handleUpdate = (formData) => {
    updateMutation.mutate(formData);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const getEventTypeColor = (type) => {
    const colors = {
      academic: "bg-blue-100 text-blue-800 border-blue-500",
      sports: "bg-green-100 text-green-800 border-green-500",
      cultural: "bg-purple-100 text-purple-800 border-purple-500",
      meeting: "bg-orange-100 text-orange-800 border-orange-500",
      holiday: "bg-red-100 text-red-800 border-red-500",
      exam: "bg-yellow-100 text-yellow-800 border-yellow-500",
      parent_teacher: "bg-pink-100 text-pink-800 border-pink-500",
      other: "bg-gray-100 text-gray-800 border-gray-500",
    };
    return colors[type] || colors.other;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Event not found</p>
        <button
          onClick={() => navigate("/events")}
          className="btn btn-primary mt-4"
        >
          Back to Events
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
            onClick={() => navigate("/events")}
            className="btn btn-outline flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Details</h1>
            <p className="text-gray-600 mt-1">
              View and manage event information
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="btn btn-danger flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Info */}
        <div className="lg:col-span-2 space-y-6">
          <div
            className={`bg-white rounded-lg shadow-md p-6 border-t-4 ${
              getEventTypeColor(event.event_type).split(" ")[2]
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {event.title}
              </h2>
              <span
                className={`badge ${
                  getEventTypeColor(event.event_type).split("border")[0]
                }`}
              >
                {event.event_type.replace("_", " ")}
              </span>
            </div>

            <div className="prose max-w-none text-gray-700 mb-8">
              <p>{event.description || "No description provided."}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(event.event_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {event.start_time && (
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-semibold text-gray-900">
                      {event.start_time}
                      {event.end_time ? ` - ${event.end_time}` : ""}
                    </p>
                  </div>
                </div>
              )}

              {event.location && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold text-gray-900">
                      {event.location}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Target Audience</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {event.target_audience.replace("_", " ")}
                  </p>
                </div>
              </div>
            </div>

            {event.is_holiday && (
              <div className="mt-8 p-4 bg-red-50 rounded-lg flex items-center space-x-3 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">
                  This event is marked as a holiday.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Meta Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Created By</p>
                <p className="font-medium text-gray-900">
                  {event.created_by_name || "Unknown"}
                </p>
                <p className="text-xs text-gray-500">
                  {event.created_by_email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created At</p>
                <p className="font-medium text-gray-900">
                  {new Date(event.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium text-gray-900">
                  {new Date(event.updated_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    event.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {event.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Event"
        size="lg"
      >
        <EventForm
          event={event}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
          isSubmitting={updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Event"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this event? This action cannot be
            undone.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-medium">{event.title}</p>
            <p className="text-xs text-red-600 mt-1">
              {new Date(event.event_date).toLocaleDateString()}
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
              {deleteMutation.isPending ? "Deleting..." : "Delete Event"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EventDetails;
