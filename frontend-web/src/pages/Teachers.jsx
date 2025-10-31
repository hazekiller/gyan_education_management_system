import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone
} from 'lucide-react';
import { teachersAPI } from '../lib/api';
import Modal from '../components/common/Modal';
import TeacherForm from '../components/common/TeacherForm';
import toast from 'react-hot-toast';

const Teachers = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

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
      setSelectedTeacher(null);
      queryClient.invalidateQueries(['teachers']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add teacher');
    }
  });

  // Update teacher mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => teachersAPI.update(id, data),
    onSuccess: () => {
      toast.success('Teacher updated successfully');
      setIsModalOpen(false);
      setSelectedTeacher(null);
      queryClient.invalidateQueries(['teachers']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update teacher');
    }
  });

  // Delete teacher mutation
  const deleteMutation = useMutation({
    mutationFn: teachersAPI.delete,
    onSuccess: () => {
      toast.success('Teacher deleted successfully');
      queryClient.invalidateQueries(['teachers']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete teacher');
    }
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (formData) => {
    if (selectedTeacher) {
      updateMutation.mutate({ id: selectedTeacher.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleAddNew = () => {
    setSelectedTeacher(null);
    setIsModalOpen(true);
  };

  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-600 mt-1">Manage teaching staff</p>
        </div>
        <button
          onClick={handleAddNew}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Teacher</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Teachers Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loading"></div>
        </div>
      ) : teachers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500">No teachers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="bg-gradient-to-r from-green-500 to-green-600 h-24"></div>
              
              <div className="px-6 pb-6">
                <div className="flex flex-col items-center -mt-12 mb-4">
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-white flex items-center justify-center">
                    {teacher.profile_photo ? (
                      <img
                        src={`http://localhost:5000/${teacher.profile_photo}`}
                        alt={teacher.first_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-green-600">
                        {teacher.first_name.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    {teacher.first_name} {teacher.last_name}
                  </h3>
                  <p className="text-sm text-gray-600">{teacher.employee_id}</p>
                  {teacher.specialization && (
                    <p className="text-sm text-blue-600 mt-1">{teacher.specialization}</p>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{teacher.phone}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <span className={`badge ${
                    teacher.status === 'active' ? 'badge-success' : 'badge-danger'
                  }`}>
                    {teacher.status}
                  </span>
                </div>

                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => navigate(`/teachers/${teacher.id}`)}
                    className="flex-1 btn btn-outline flex items-center justify-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleEdit(teacher)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(teacher.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
            <p className="text-sm text-gray-600">Total Teachers</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {teachers.filter(t => t.status === 'active').length}
            </p>
            <p className="text-sm text-gray-600">Active</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {teachers.filter(t => t.gender === 'male').length}
            </p>
            <p className="text-sm text-gray-600">Male</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-pink-600">
              {teachers.filter(t => t.gender === 'female').length}
            </p>
            <p className="text-sm text-gray-600">Female</p>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTeacher(null);
        }}
        title={selectedTeacher ? 'Edit Teacher' : 'Add New Teacher'}
        size="lg"
      >
        <TeacherForm
          teacher={selectedTeacher}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedTeacher(null);
          }}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </div>
  );
};

export default Teachers;