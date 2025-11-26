import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Eye, Users, BookOpen } from "lucide-react";
import { classesAPI } from "../../lib/api";
import Modal from "../common/Modal";
import ClassForm from "../common/ClassForm";
import PermissionGuard from "../common/PermissionGuard";
import { PERMISSIONS } from "../../utils/rbac";
import toast from "react-hot-toast";

const ClassTable = ({ classes, isLoading, onRefetch, teachers }) => {
  const navigate = useNavigate();
  const [editClass, setEditClass] = useState(null);
  const [deleteClass, setDeleteClass] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEdit = (classItem) => {
    setEditClass(classItem);
    setShowEditModal(true);
  };

  const handleDelete = (classItem) => {
    setDeleteClass(classItem);
    setShowDeleteModal(true);
  };

  const handleUpdateClass = async (formData) => {
    try {
      await classesAPI.update(editClass.id, formData);
      toast.success("Class updated successfully!");
      setShowEditModal(false);
      setEditClass(null);
      onRefetch();
    } catch (error) {
      toast.error(error.message || "Failed to update class");
    }
  };

  const confirmDelete = async () => {
    try {
      await classesAPI.delete(deleteClass.id);
      toast.success("Class deleted successfully!");
      setShowDeleteModal(false);
      setDeleteClass(null);
      onRefetch();
    } catch (error) {
      toast.error(error.message || "Failed to delete class");
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

  if (!classes || classes.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">No classes found</p>
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
                  Class Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class Teacher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Academic Year
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
              {classes.map((classItem) => (
                <tr key={classItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-purple-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {classItem.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Capacity: {classItem.capacity || 40}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Grade {classItem.grade_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {classItem.class_teacher_name ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {classItem.class_teacher_name}
                          </div>
                          {classItem.teacher_employee_id && (
                            <div className="text-xs text-gray-500">
                              ID: {classItem.teacher_employee_id}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">
                          No teacher assigned
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {classItem.capacity || (
                      <span className="text-gray-400 italic">N/A</span>
                    )}
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {classItem.room_number || (
                      <span className="text-gray-400 italic">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Users className="w-4 h-4 mr-1 text-gray-400" />
                      {classItem.student_count || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {classItem.academic_year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        classItem.status === "active"
                          ? "bg-green-100 text-green-800"
                          : classItem.status === "inactive"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {classItem.status || "active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/classes/${classItem.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      <PermissionGuard permission={PERMISSIONS.EDIT_CLASSES}>
                        <button
                          onClick={() => handleEdit(classItem)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      </PermissionGuard>

                      <PermissionGuard permission={PERMISSIONS.DELETE_CLASSES}>
                        <button
                          onClick={() => handleDelete(classItem)}
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
          setEditClass(null);
        }}
        title="Edit Class"
        size="large"
      >
        <ClassForm
          classItem={editClass}
          onSubmit={handleUpdateClass}
          onCancel={() => {
            setShowEditModal(false);
            setEditClass(null);
          }}
          teachers={teachers}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteClass(null);
        }}
        title="Delete Class"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{deleteClass?.name}</strong>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteClass(null);
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

export default ClassTable;

