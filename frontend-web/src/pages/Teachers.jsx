import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Filter
} from 'lucide-react';
import { teachersAPI } from '../lib/api';
import Modal from '../components/common/Modal';
import TeacherForm from '../components/common/TeacherForm';
import TeacherTable from '../components/teachers/TeacherTable'; // Import the new component
import toast from 'react-hot-toast';
import PermissionGuard from '../components/common/PermissionGuard';
import { PERMISSIONS } from '../utils/rbac';

const Teachers = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: teachersData, isLoading } = useQuery({
    queryKey: ['teachers', searchTerm],
    queryFn: () => teachersAPI.getAll({ search: searchTerm })
  });

  const teachers = teachersData?.data || [];

  // Create teacher mutation
  const createMutation = useMutation({
    mutationFn: teachersAPI.create,
    onSuccess: () => {
      toast.success('Teacher added successfully');
      setIsModalOpen(false);
      queryClient.invalidateQueries(['teachers']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add teacher');
    }
  });

  const handleAddNew = () => {
    setIsModalOpen(true);
  };

  const handleUpdate = () => {
    queryClient.invalidateQueries(['teachers']);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-600 mt-1">Manage teaching staff</p>
        </div>

        <PermissionGuard permission={PERMISSIONS.CREATE_TEACHERS}>
          <button
            onClick={handleAddNew}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Teacher</span>
          </button>
        </PermissionGuard>
      </div>

      {/* Filters & Search */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search teachers by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          {/* Reset Button */}
          <button
            onClick={() => setSearchTerm("")}
            className="btn btn-outline flex items-center justify-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Teachers Split View Table */}
      <TeacherTable
        teachers={teachers}
        isLoading={isLoading}
        onUpdate={handleUpdate}
      />

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Teacher"
        size="lg"
      >
        <TeacherForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={createMutation.isPending}
        />
      </Modal>
    </div>
  );
};

export default Teachers;