import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Calendar, MapPin, Clock, Users } from "lucide-react";
import { eventsAPI } from "../lib/api";
import Modal from "../components/common/Modal";
import EventForm from "../components/common/EventForm";
import toast from "react-hot-toast";
import PermissionGuard from "../components/common/PermissionGuard";
import { PERMISSIONS } from "../utils/rbac";

const Events = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("upcoming");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventsAPI.getAll(),
  });

  const events = eventsData?.data || [];

  // Create event mutation
  const createMutation = useMutation({
    mutationFn: eventsAPI.create,
    onSuccess: () => {
      toast.success("Event created successfully");
      setIsModalOpen(false);
      queryClient.invalidateQueries(["events"]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create event");
    },
  });

  const handleSubmit = (formData) => {
    createMutation.mutate(formData);
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

  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === "upcoming") return eventDate >= today;
    if (filter === "past") return eventDate < today;
    return true;
  });

  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(a.event_date) - new Date(b.event_date)
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              Events Calendar
            </h1>
            <p className="text-gray-500 mt-1 ml-12">
              Manage and track upcoming school activities and important dates.
            </p>
          </div>
          <PermissionGuard permissions={[PERMISSIONS.CREATE_EVENTS]}>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-200 flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Create Event</span>
            </button>
          </PermissionGuard>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-gray-300 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Events</p>
              <h3 className="text-2xl font-bold text-gray-900">{events.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
              <Calendar className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-green-300 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Upcoming</p>
              <h3 className="text-2xl font-bold text-green-600">
                {events.filter((e) => new Date(e.event_date) >= new Date()).length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-300 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Academic</p>
              <h3 className="text-2xl font-bold text-blue-600">
                {events.filter((e) => e.event_type === "academic").length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-red-300 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Holidays</p>
              <h3 className="text-2xl font-bold text-red-600">
                {events.filter((e) => e.is_holiday).length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters and List */}
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex p-1 bg-white rounded-xl shadow-sm border border-gray-100 w-fit">
            {[
              { id: 'upcoming', label: 'Upcoming Events' },
              { id: 'past', label: 'Past Events' },
              { id: 'all', label: 'All Events' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${filter === tab.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Events List */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">Loading events...</p>
            </div>
          ) : sortedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100 text-center px-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Calendar className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Found</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-8">
                There are currently no events matching your filter.
                {PERMISSIONS.CREATE_EVENTS && " Create a new event to get started."}
              </p>
              <PermissionGuard permissions={[PERMISSIONS.CREATE_EVENTS]}>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn btn-primary bg-blue-600 text-white rounded-xl px-6"
                >
                  Create First Event
                </button>
              </PermissionGuard>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedEvents.map((event) => {
                // Custom hook logic inside map, purely for UI calculation
                const date = new Date(event.event_date);
                const month = date.toLocaleDateString('en-US', { month: 'short' });
                const day = date.getDate();
                const typeStyle = getEventTypeColor(event.event_type);

                return (
                  <div
                    key={event.id}
                    className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden relative"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${typeStyle.split(' ')[0]}`}></div>

                    <div className="p-6 flex flex-col md:flex-row gap-6">
                      {/* Date Badge */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center shadow-sm">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{month}</span>
                          <span className="text-2xl font-bold text-gray-900">{day}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => navigate(`/events/${event.id}`)}>
                              {event.title}
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${typeStyle}`}>
                                {event.event_type.replace('_', ' ')}
                              </span>
                              {event.is_holiday && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-red-100 text-red-700 border border-red-200">
                                  Holiday
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(`/events/${event.id}`)}
                            className="btn btn-sm btn-outline rounded-lg opacity-0 group-hover:opacity-100 transition-opacity self-start"
                          >
                            View Details
                          </button>
                        </div>

                        {event.description && (
                          <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                            {event.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-500 border-t border-gray-50 pt-3">
                          {event.start_time && event.end_time && (
                            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded">
                              <Clock className="w-3.5 h-3.5 text-blue-500" />
                              <span>{event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)}</span>
                            </div>
                          )}

                          {event.location && (
                            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded">
                              <MapPin className="w-3.5 h-3.5 text-red-500" />
                              <span>{event.location}</span>
                            </div>
                          )}

                          {event.target_audience && (
                            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded">
                              <Users className="w-3.5 h-3.5 text-purple-500" />
                              <span className="capitalize">{event.target_audience.replace('_', ' ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Event"
        size="lg"
      >
        <EventForm
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={createMutation.isPending}
        />
      </Modal>
    </div>
  );
};

export default Events;
