import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { classesAPI } from '../../lib/api';
import toast from 'react-hot-toast';

const ExamForm = ({ exam = null, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: exam?.name || '',
    exam_type: exam?.exam_type || 'term',
    class_id: exam?.class_id || '',
    start_date: exam?.start_date?.split('T')[0] || '',
    end_date: exam?.end_date?.split('T')[0] || '',
    total_marks: exam?.total_marks || '',
    passing_marks: exam?.passing_marks || '',
    academic_year: exam?.academic_year || '2024-2025',
    description: exam?.description || ''
  });

  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: classesAPI.getAll
  });

  const classes = classesData?.data || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.class_id || !formData.start_date || !formData.end_date) {
      toast.error('Please fill all required fields');
      return;
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      toast.error('End date must be after start date');
      return;
    }

    if (parseInt(formData.passing_marks) > parseInt(formData.total_marks)) {
      toast.error('Passing marks cannot be greater than total marks');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Exam Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input"
            placeholder="e.g., First Term Exam"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Exam Type *
          </label>
          <select
            name="exam_type"
            value={formData.exam_type}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="term">Term Exam</option>
            <option value="midterm">Midterm</option>
            <option value="final">Final Exam</option>
            <option value="unit_test">Unit Test</option>
            <option value="monthly">Monthly Test</option>
            <option value="quarterly">Quarterly Exam</option>
            <option value="annual">Annual Exam</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
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
          <label className="block text-sm font-medium text-black mb-2">
            Academic Year *
          </label>
          <select
            name="academic_year"
            value={formData.academic_year}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="2024-2025">2024-2025</option>
            <option value="2023-2024">2023-2024</option>
            <option value="2025-2026">2025-2026</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Start Date *
          </label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            End Date *
          </label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Total Marks *
          </label>
          <input
            type="number"
            name="total_marks"
            value={formData.total_marks}
            onChange={handleChange}
            className="input"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Passing Marks *
          </label>
          <input
            type="number"
            name="passing_marks"
            value={formData.passing_marks}
            onChange={handleChange}
            className="input"
            min="1"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-black mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input"
            rows="3"
            placeholder="Enter exam description or instructions..."
          />
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
          {isSubmitting ? 'Creating...' : exam ? 'Update Exam' : 'Create Exam'}
        </button>
      </div>
    </form>
  );
};

export default ExamForm;
