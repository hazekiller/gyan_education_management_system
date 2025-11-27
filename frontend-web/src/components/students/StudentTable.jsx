import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Eye, MoreVertical } from 'lucide-react';
import { studentsAPI } from '../../lib/api';
import Modal from '../common/Modal';
import StudentForm from '../common/StudentForm';
import PermissionGuard from '../common/PermissionGuard';
import { PERMISSIONS } from '../../utils/rbac';
import toast from 'react-hot-toast';

const StudentTable = ({ students, isLoading, onRefetch }) => {
  const navigate = useNavigate();
  const [editStudent, setEditStudent] = useState(null);
  const [deleteStudent, setDeleteStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEdit = (student) => {
    setEditStudent(student);
    setShowEditModal(true);
  };

  const handleDelete = (student) => {
    setDeleteStudent(student);
    setShowDeleteModal(true);
  };

  const handleUpdateStudent = async (formData) => {
    try {
      await studentsAPI.update(editStudent.id, formData);
      toast.success('Student updated successfully!');
      setShowEditModal(false);
      setEditStudent(null);
      onRefetch();
    } catch (error) {
      toast.error(error.message || 'Failed to update student');
    }
  };

  const confirmDelete = async () => {
    try {
      await studentsAPI.delete(deleteStudent.id);
      toast.success('Student deleted successfully!');
      setShowDeleteModal(false);
      setDeleteStudent(null);
      onRefetch();
    } catch (error) {
      toast.error(error.message || 'Failed to delete student');
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">No students found</p>
      </div>
    );
  }

  return (
    <>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admission No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.first_name} {student.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.admission_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.class_name} {student.section_name && `- ${student.section_name}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.parent_phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      student.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/students/${student.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      
                      <PermissionGuard permission={PERMISSIONS.EDIT_STUDENTS}>
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      </PermissionGuard>

                      <PermissionGuard permission={PERMISSIONS.DELETE_STUDENTS}>
                        <button
                          onClick={() => handleDelete(student)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditStudent(null);
        }}
        title="Edit Student"
        size="md"
      >
        <StudentForm
          student={editStudent}
          onSubmit={handleUpdateStudent}
          onCancel={() => {
            setShowEditModal(false);
            setEditStudent(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteStudent(null);
        }}
        title="Delete Student"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{deleteStudent?.first_name} {deleteStudent?.last_name}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteStudent(null);
              }}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="btn bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default StudentTable;
