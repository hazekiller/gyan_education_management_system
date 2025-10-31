import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, Megaphone, AlertCircle, Info } from 'lucide-react';
import { announcementsAPI } from '../lib/api';
import Modal from '../components/common/Modal';
import AnnouncementForm from '../components/common/AnnouncementForm';
import toast from 'react-hot-toast';

const Announcements = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: announcementsData, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: announcementsAPI.getAll
  });

  const announcements = announcementsData?.data || [];

  // Create announcement mutation
  const createMutation = useMutation({
    mutationFn: announcementsAPI.create,
    onSuccess: () => {
      toast.success('Announcement published successfully');
      setIsModalOpen(false);
      queryClient.invalidateQueries(['announcements']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to publish announcement');
    }
  });

  const handleSubmit = (formData) => {
    createMutation.mutate(formData);
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'high':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'medium':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'border-red-500 bg-red-50',
      high: 'border-orange-500 bg-orange-50',
      medium: 'border-blue-500 bg-blue-50',
      low: 'border-gray-500 bg-gray-50'
    };
    return colors[priority] || colors.low;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-1">Important notices and updates</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Announcements List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loading"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No announcements yet</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            Publish First Announcement
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${getPriorityColor(announcement.priority)}`}
            >
              <div className="flex items-start space-x-4">
                {/* Priority Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getPriorityIcon(announcement.priority)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {announcement.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>
                          {new Date(announcement.published_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="capitalize">
                          Target: {announcement.target_audience.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`badge ${
                        announcement.priority === 'urgent'
                          ? 'badge-danger'
                          : announcement.priority === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : announcement.priority === 'medium'
                          ? 'badge-info'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {announcement.priority}
                    </span>
                  </div>

                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                  </div>

                  {announcement.expires_at && (
                    <div className="mt-4 text-sm text-gray-500">
                      Expires on:{' '}
                      {new Date(announcement.expires_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Announcement Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {announcements.length}
            </p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {announcements.filter(a => a.priority === 'urgent').length}
            </p>
            <p className="text-sm text-gray-600">Urgent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {announcements.filter(a => a.priority === 'high').length}
            </p>
            <p className="text-sm text-gray-600">High Priority</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {announcements.filter(a => a.target_audience === 'all').length}
            </p>
            <p className="text-sm text-gray-600">For Everyone</p>
          </div>
        </div>
      </div>

      {/* Create Announcement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish New Announcement"
        size="lg"
      >
        <AnnouncementForm
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={createMutation.isPending}
        />
      </Modal>
    </div>
  );
};

export default Announcements;