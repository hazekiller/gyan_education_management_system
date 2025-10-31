import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar, BookOpen, FileText } from 'lucide-react';
import { examsAPI } from '../lib/api';
import Modal from '../components/common/Modal';
import ExamForm from '../components/common/ExamForm';
import toast from 'react-hot-toast';

const Exams = () => {
  const queryClient = useQueryClient();
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2024-2025');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: examsData, isLoading } = useQuery({
    queryKey: ['exams', selectedAcademicYear],
    queryFn: () => examsAPI.getAll({ academic_year: selectedAcademicYear })
  });

  const exams = examsData?.data || [];

  // Create exam mutation
  const createMutation = useMutation({
    mutationFn: examsAPI.create,
    onSuccess: () => {
      toast.success('Exam created successfully');
      setIsModalOpen(false);
      queryClient.invalidateQueries(['exams']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create exam');
    }
  });

  const handleSubmit = (formData) => {
    createMutation.mutate(formData);
  };

  const getExamTypeColor = (type) => {
    const colors = {
      term: 'bg-blue-100 text-blue-800',
      midterm: 'bg-purple-100 text-purple-800',
      final: 'bg-red-100 text-red-800',
      unit_test: 'bg-green-100 text-green-800',
      monthly: 'bg-yellow-100 text-yellow-800',
      quarterly: 'bg-orange-100 text-orange-800',
      annual: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Examinations</h1>
          <p className="text-gray-600 mt-1">Manage exams and results</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Exam</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Year
            </label>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="input"
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2022-2023">2022-2023</option>
            </select>
          </div>
        </div>
      </div>

      {/* Exams List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loading"></div>
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No exams scheduled yet</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            Create First Exam
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              {/* Exam Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {exam.name}
                  </h3>
                  <span className={`badge ${getExamTypeColor(exam.exam_type)}`}>
                    {exam.exam_type.replace('_', ' ')}
                  </span>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>

              {/* Exam Details */}
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>
                    {new Date(exam.start_date).toLocaleDateString()} - {' '}
                    {new Date(exam.end_date).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <FileText className="w-4 h-4 mr-2" />
                  <span>{exam.class_name}</span>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Marks:</span>
                    <span className="font-semibold text-gray-900">
                      {exam.total_marks}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Passing Marks:</span>
                    <span className="font-semibold text-gray-900">
                      {exam.passing_marks}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button className="flex-1 btn btn-outline text-sm">
                    View Details
                  </button>
                  <button className="flex-1 btn btn-primary text-sm">
                    Enter Results
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Exam Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{exams.length}</p>
            <p className="text-sm text-gray-600">Total Exams</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {exams.filter(e => new Date(e.end_date) < new Date()).length}
            </p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {exams.filter(e => 
                new Date(e.start_date) <= new Date() && 
                new Date(e.end_date) >= new Date()
              ).length}
            </p>
            <p className="text-sm text-gray-600">Ongoing</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {exams.filter(e => new Date(e.start_date) > new Date()).length}
            </p>
            <p className="text-sm text-gray-600">Upcoming</p>
          </div>
        </div>
      </div>

      {/* Create Exam Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Exam"
        size="lg"
      >
        <ExamForm
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={createMutation.isPending}
        />
      </Modal>
    </div>
  );
};

export default Exams;
