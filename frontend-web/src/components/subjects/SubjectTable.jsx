// src/components/subjects/SubjectTable.jsx
import { useState } from 'react';
import { Edit, Trash2, BookOpen } from 'lucide-react';
import { subjectsAPI } from '../../lib/api';
import Modal from '../common/Modal';
import SubjectForm from './SubjectForm';
import PermissionGuard from '../common/PermissionGuard';
import { PERMISSIONS } from '../../utils/rbac';
import toast from 'react-hot-toast';

const SubjectTable = ({ subjects, isLoading, onRefetch }) => {
    const [editSubject, setEditSubject] = useState(null);
    const [deleteSubject, setDeleteSubject] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleEdit = (subject) => {
        setEditSubject(subject);
        setShowEditModal(true);
    };

    const handleDelete = (subject) => {
        setDeleteSubject(subject);
        setShowDeleteModal(true);
    };

    const handleUpdateSubject = async (formData) => {
        try {
            await subjectsAPI.update(editSubject.id, formData);
            toast.success('Subject updated successfully!');
            setShowEditModal(false);
            setEditSubject(null);
            onRefetch();
        } catch (error) {
            toast.error(error.message || 'Failed to update subject');
        }
    };

    const confirmDelete = async () => {
        try {
            await subjectsAPI.delete(deleteSubject.id);
            toast.success('Subject deleted successfully!');
            setShowDeleteModal(false);
            setDeleteSubject(null);
            onRefetch();
        } catch (error) {
            toast.error(error.message || 'Failed to delete subject');
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

    if (!subjects || subjects.length === 0) {
        return (
            <div className="card text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No subjects found</p>
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
                                    Subject
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Code
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
                            {subjects.map((subject) => (
                                <tr key={subject.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                    <BookOpen className="w-5 h-5 text-purple-600" />
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {subject.name}
                                                </div>
                                                {subject.description && (
                                                    <div className="text-sm text-gray-500">{subject.description}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {subject.code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${subject.is_active === 1
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {subject.is_active === 1 ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <PermissionGuard permission={PERMISSIONS.MANAGE_CLASS_SUBJECTS}>
                                                <button
                                                    onClick={() => handleEdit(subject)}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                            </PermissionGuard>

                                            <PermissionGuard permission={PERMISSIONS.MANAGE_CLASS_SUBJECTS}>
                                                <button
                                                    onClick={() => handleDelete(subject)}
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
                    setEditSubject(null);
                }}
                title="Edit Subject"
                size="md"
            >
                <SubjectForm
                    subject={editSubject}
                    onSubmit={handleUpdateSubject}
                    onCancel={() => {
                        setShowEditModal(false);
                        setEditSubject(null);
                    }}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeleteSubject(null);
                }}
                title="Delete Subject"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to delete <strong>{deleteSubject?.name}</strong>?
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={() => {
                                setShowDeleteModal(false);
                                setDeleteSubject(null);
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

export default SubjectTable;