import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileText, Calendar, Clock } from 'lucide-react';
import { assignmentsAPI } from '../lib/api';
import Modal from '../components/common/Modal';
import AssignmentForm from '../components/common/AssignmentForm';
import toast from 'react-hot-toast';

const Assignments = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: assignmentsData, isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => assignmentsAPI.getAll()
  });

  const assignments = assignmentsData?.data || [];

  // Create assignment mutation
  const createMutation = useMutation({
    mutationFn: assignmentsAPI.create,
    onSuccess: () => {
      toast.success('Assignment created successfully');
      setIsModalOpen(false);
      queryClient.invalidateQueries(['assignments']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create assignment');
    }
  });

  const handleSubmit = (formData) => {
    createMutation.mutate(formData);
  };

  const getStatusColor = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return 'text-red-600';
    if (daysUntilDue <= 3) return 'text-orange-600';
    return 'text-green-600';
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    const now = new Date();
    const due = new Date(assignment.due_date);
    
    if (filter === 'upcoming') return due > now;
    if (filter === 'overdue') return due < now;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 mt-1">Manage homework and assignments</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Assignment</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Assignments
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'overdue'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overdue
          </button>
        </div>
      </div>

      {/* Assignments List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loading"></div>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No assignments found</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            Create First Assignment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {assignment.class_name} - {assignment.section_name} • {assignment.subject_name}
                      </p>
                    </div>
                  </div>

                  {assignment.description && (
                    <p className="text-gray-700 mt-2 mb-4">
                      {assignment.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className={`w-4 h-4 ${getStatusColor(assignment.due_date)}`} />
                      <span className={getStatusColor(assignment.due_date)}>
                        {Math.ceil(
                          (new Date(assignment.due_date) - new Date()) / (1000 * 60 * 60 * 24)
                        )}{' '}
                        days left
                      </span>
                    </div>
                    <div className="text-gray-600">
                      Total Marks: <span className="font-semibold">{assignment.total_marks}</span>
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  <button className="btn btn-outline">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {assignments.length}
            </p>
            <p className="text-sm text-gray-600">Total Assignments</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {assignments.filter(a => new Date(a.due_date) > new Date()).length}
            </p>
            <p className="text-sm text-gray-600">Upcoming</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {assignments.filter(a => new Date(a.due_date) < new Date()).length}
            </p>
            <p className="text-sm text-gray-600">Overdue</p>
          </div>
        </div>
      </div>

      {/* Create Assignment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Assignment"
        size="lg"
      >
        <AssignmentForm
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={createMutation.isPending}
        />
      </Modal>
    </div>
  );
};

export default Assignments;
