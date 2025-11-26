import { useState, useEffect } from 'react';

const SubjectForm = ({ subject, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    is_active: 1
  });

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name || '',
        code: subject.code || '',
        description: subject.description || '',
        is_active: subject.is_active
      });
    }
  }, [subject]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Subject Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="input w-full"
          placeholder="e.g., Mathematics"
          required
        />
      </div>

      {/* Subject Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={(e) => handleChange({
            target: {
              name: 'code',
              value: e.target.value.toUpperCase()
            }
          })}
          className="input w-full"
          placeholder="e.g., MATH"
          maxLength={20}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="input w-full"
          rows="3"
          placeholder="Brief description of the subject..."
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          name="is_active"
          value={formData.is_active}
          onChange={handleChange}
          className="input w-full"
        >
          <option value={1}>Active</option>
          <option value={0}>Inactive</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          {subject ? 'Update Subject' : 'Create Subject'}
        </button>
      </div>
    </form>
  );
};

export default SubjectForm;