import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { classesAPI } from '../../lib/api';
import toast from 'react-hot-toast';

const AssignmentForm = ({ assignment = null, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: assignment?.title || '',
    description: assignment?.description || '',
    class_id: assignment?.class_id || '',
    section_id: assignment?.section_id || '',
    subject_id: assignment?.subject_id || '',
    due_date: assignment?.due_date?.split('T')[0] || '',
    total_marks: assignment?.total_marks || '',
    attachments: null
  });

  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: classesAPI.getAll
  });

  const { data: sectionsData } = useQuery({
    queryKey: ['sections', formData.class_id],
    queryFn: () => classesAPI.getSections(formData.class_id),
    enabled: !!formData.class_id
  });

  const classes = classesData?.data || [];
  const sections = sectionsData?.data || [];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.class_id || !formData.section_id || !formData.due_date) {
      toast.error('Please fill all required fields');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assignment Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input"
            placeholder="e.g., Mathematics Chapter 5 - Homework"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input"
            rows="4"
            placeholder="Enter assignment instructions and details..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Class *
          </label>
          <select
            name="class_id"
            value={formData.class_id}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Section *
          </label>
          <select
            name="section_id"
            value={formData.section_id}
            onChange={handleChange}
            className="input"
            required
            disabled={!formData.class_id}
          >
            <option value="">Select Section</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due Date *
          </label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className="input"
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Marks *
          </label>
          <input
            type="number"
            name="total_marks"
            value={formData.total_marks}
            onChange={handleChange}
            className="input"
            min="1"
            placeholder="e.g., 100"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attachments
          </label>
          <input
            type="file"
            name="attachments"
            onChange={handleChange}
            className="input"
            multiple
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Accepted formats: PDF, DOC, DOCX, PNG, JPG (Max 5 files)
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
          {isSubmitting ? 'Creating...' : 'Create Assignment'}
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm;