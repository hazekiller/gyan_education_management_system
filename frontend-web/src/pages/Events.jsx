import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar, MapPin, Clock, Users } from 'lucide-react';
import { eventsAPI } from '../lib/api';
import Modal from '../components/common/Modal';
import EventForm from '../components/common/EventForm';
import toast from 'react-hot-toast';

const Events = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('upcoming');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsAPI.getAll()
  });

  const events = eventsData?.data || [];

  // Create event mutation
  const createMutation = useMutation({
    mutationFn: eventsAPI.create,
    onSuccess: () => {
      toast.success('Event created successfully');
      setIsModalOpen(false);
      queryClient.invalidateQueries(['events']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create event');
    }
  });

  const handleSubmit = (formData) => {
    createMutation.mutate(formData);
  };

  const getEventTypeColor = (type) => {
    const colors = {
      academic: 'bg-blue-100 text-blue-800 border-blue-500',
      sports: 'bg-green-100 text-green-800 border-green-500',
      cultural: 'bg-purple-100 text-purple-800 border-purple-500',
      meeting: 'bg-orange-100 text-orange-800 border-orange-500',
      holiday: 'bg-red-100 text-red-800 border-red-500',
      exam: 'bg-yellow-100 text-yellow-800 border-yellow-500',
      parent_teacher: 'bg-pink-100 text-pink-800 border-pink-500',
      other: 'bg-gray-100 text-gray-800 border-gray-500'
    };
    return colors[type] || colors.other;
  };

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === 'upcoming') return eventDate >= today;
    if (filter === 'past') return eventDate < today;
    return true;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => 
    new Date(a.event_date) - new Date(b.event_date)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events Calendar</h1>
          <p className="text-gray-600 mt-1">Manage school events and activities</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upcoming Events
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'past'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Past Events
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Events
          </button>
        </div>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loading"></div>
        </div>
      ) : sortedEvents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No events found</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            Create First Event
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedEvents.map((event) => (
            <div
              key={event.id}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow ${
                getEventTypeColor(event.event_type).split(' ')[2]
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center min-w-[80px]">
                      <p className="text-2xl font-bold text-blue-600">
                        {new Date(event.event_date).getDate()}
                      </p>
                      <p className="text-sm text-blue-600">
                        {new Date(event.event_date).toLocaleDateString('en-US', { 
                          month: 'short' 
                        })}
                      </p>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {event.title}
                        </h3>
                        <span className={`badge ${getEventTypeColor(event.event_type).split('border')[0]}`}>
                          {event.event_type.replace('_', ' ')}
                        </span>
                      </div>

                      {event.description && (
                        <p className="text-gray-700 mb-4">{event.description}</p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {event.start_time && event.end_time && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>
                              {event.start_time} - {event.end_time}
                            </span>
                          </div>
                        )}

                        {event.location && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}

                        {event.target_audience && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span className="capitalize">
                              {event.target_audience.replace('_', ' ')}
                            </span>
                          </div>
                        )}
                      </div>

                      {event.is_holiday && (
                        <div className="mt-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            Holiday
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex flex-col space-y-2">
                  <button className="btn btn-outline text-sm">
                    View Details
                  </button>
                  <button className="btn btn-outline text-sm">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Event Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{events.length}</p>
            <p className="text-sm text-gray-600">Total Events</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {events.filter(e => new Date(e.event_date) >= new Date()).length}
            </p>
            <p className="text-sm text-gray-600">Upcoming</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {events.filter(e => e.event_type === 'academic').length}
            </p>
            <p className="text-sm text-gray-600">Academic</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {events.filter(e => e.is_holiday).length}
            </p>
            <p className="text-sm text-gray-600">Holidays</p>
          </div>
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
