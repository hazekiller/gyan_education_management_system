import { useState } from 'react';
import toast from 'react-hot-toast';

const AnnouncementForm = ({ announcement = null, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: announcement?.title || '',
    content: announcement?.content || '',
    priority: announcement?.priority || 'medium',
    target_audience: announcement?.target_audience || 'all',
    published_at: announcement?.published_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    expires_at: announcement?.expires_at?.split('T')[0] || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.expires_at && new Date(formData.expires_at) < new Date(formData.published_at)) {
      toast.error('Expiry date must be after publish date');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Announcement Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input"
            placeholder="e.g., School Reopening Date"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="input"
            rows="6"
            placeholder="Enter announcement content..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority *
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Audience *
          </label>
          <select
            name="target_audience"
            value={formData.target_audience}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="all">All</option>
            <option value="students">Students Only</option>
            <option value="teachers">Teachers Only</option>
            <option value="parents">Parents Only</option>
            <option value="staff">Staff Only</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Publish Date *
          </label>
          <input
            type="date"
            name="published_at"
            value={formData.published_at}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date (Optional)
          </label>
          <input
            type="date"
            name="expires_at"
            value={formData.expires_at}
            onChange={handleChange}
            className="input"
            min={formData.published_at}
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty if announcement doesn't expire
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Publishing...' : announcement ? 'Update Announcement' : 'Publish Announcement'}
        </button>
      </div>
    </form>
  );
};

export default AnnouncementForm;


