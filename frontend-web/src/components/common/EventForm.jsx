import { useState } from 'react';
import toast from 'react-hot-toast';

const EventForm = ({ event = null, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    event_type: event?.event_type || 'academic',
    event_date: event?.event_date?.split('T')[0] || '',
    start_time: event?.start_time || '',
    end_time: event?.end_time || '',
    location: event?.location || '',
    target_audience: event?.target_audience || 'all',
    is_holiday: event?.is_holiday || false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.event_date) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      toast.error('End time must be after start time');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
        <h4 className="text-sm font-bold text-blue-800 mb-1">Event Details</h4>
        <p className="text-xs text-blue-600">Provide the details for the new school event.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Event Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input w-full bg-gray-50 focus:bg-white transition-colors py-2.5"
            placeholder="e.g., Annual Sports Day"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input w-full bg-gray-50 focus:bg-white transition-colors py-2.5 min-h-[100px]"
            rows="3"
            placeholder="Enter event description..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Event Type *
          </label>
          <select
            name="event_type"
            value={formData.event_type}
            onChange={handleChange}
            className="input w-full bg-gray-50 focus:bg-white transition-colors py-2.5"
            required
          >
            <option value="academic">Academic</option>
            <option value="sports">Sports</option>
            <option value="cultural">Cultural</option>
            <option value="meeting">Meeting</option>
            <option value="holiday">Holiday</option>
            <option value="exam">Exam</option>
            <option value="parent_teacher">Parent-Teacher Meet</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Event Date *
          </label>
          <input
            type="date"
            name="event_date"
            value={formData.event_date}
            onChange={handleChange}
            className="input w-full bg-gray-50 focus:bg-white transition-colors py-2.5"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Start Time
          </label>
          <input
            type="time"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            className="input w-full bg-gray-50 focus:bg-white transition-colors py-2.5"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            End Time
          </label>
          <input
            type="time"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            className="input w-full bg-gray-50 focus:bg-white transition-colors py-2.5"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="input w-full bg-gray-50 focus:bg-white transition-colors py-2.5"
            placeholder="e.g., School Auditorium"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Target Audience *
          </label>
          <select
            name="target_audience"
            value={formData.target_audience}
            onChange={handleChange}
            className="input w-full bg-gray-50 focus:bg-white transition-colors py-2.5"
            required
          >
            <option value="all">All</option>
            <option value="students">Students Only</option>
            <option value="teachers">Teachers Only</option>
            <option value="parents">Parents Only</option>
            <option value="staff">Staff Only</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-white hover:border-gray-300 transition-all">
            <input
              type="checkbox"
              name="is_holiday"
              checked={formData.is_holiday}
              onChange={handleChange}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Mark this event as a Holiday
            </span>
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 font-medium transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </form>
  );
};

export default EventForm;