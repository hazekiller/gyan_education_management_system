import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  FileText,
} from "lucide-react";
import { admissionsAPI } from "../lib/api";
import Modal from "../components/common/Modal";
import AdmissionForm from "../components/admissions/AdmissionForm";
import PermissionGuard from "../components/common/PermissionGuard";
import { PERMISSIONS } from "../utils/rbac";
import toast from "react-hot-toast";

const Admissions = () => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });

  const { data: admissionsData, isLoading } = useQuery({
    queryKey: ["admissions", filters],
    queryFn: () => admissionsAPI.getAll(filters),
  });

  const handleCreate = async (formData) => {
    try {
      await admissionsAPI.create(formData);
      toast.success("Admission application created successfully");
      setShowAddModal(false);
      queryClient.invalidateQueries(["admissions"]);
    } catch (error) {
      toast.error(error.message || "Failed to create admission");
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await admissionsAPI.update(selectedAdmission.id, formData);
      toast.success("Admission updated successfully");
      setShowEditModal(false);
      setSelectedAdmission(null);
      queryClient.invalidateQueries(["admissions"]);
    } catch (error) {
      toast.error(error.message || "Failed to update admission");
    }
  };

  const handleDelete = async () => {
    try {
      await admissionsAPI.delete(selectedAdmission.id);
      toast.success("Admission deleted successfully");
      setShowDeleteModal(false);
      setSelectedAdmission(null);
      queryClient.invalidateQueries(["admissions"]);
    } catch (error) {
      toast.error(error.message || "Failed to delete admission");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      rejected: "bg-red-100 text-red-800",
      admitted: "bg-green-100 text-green-800",
    };
    return (
      <span
        className={`px-2 py-1 text-xs rounded-full font-medium ${
          styles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admissions</h1>
          <p className="text-gray-600 mt-1">
            Manage student admission applications
          </p>
        </div>
        <PermissionGuard permission={PERMISSIONS.MANAGE_ADMISSIONS}>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Admission</span>
          </button>
        </PermissionGuard>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, application number..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="input pl-10 w-full"
            />
          </div>
          <div>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="input w-full"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="admitted">Admitted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button
            onClick={() => setFilters({ search: "", status: "" })}
            className="btn btn-outline flex items-center justify-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="loading mx-auto"></div>
                  </td>
                </tr>
              ) : admissionsData?.data?.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No admission records found</p>
                  </td>
                </tr>
              ) : (
                admissionsData?.data?.map((admission) => (
                  <tr key={admission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {admission.application_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {admission.first_name} {admission.last_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {admission.gender}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admission.class_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {admission.parent_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {admission.parent_phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(
                        admission.application_date
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(admission.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <PermissionGuard
                          permission={PERMISSIONS.MANAGE_ADMISSIONS}
                        >
                          <button
                            onClick={() => {
                              setSelectedAdmission(admission);
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAdmission(admission);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="New Admission Application"
        size="large"
      >
        <AdmissionForm
          onSubmit={handleCreate}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAdmission(null);
        }}
        title="Edit Admission Details"
        size="large"
      >
        <AdmissionForm
          admission={selectedAdmission}
          onSubmit={handleUpdate}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedAdmission(null);
          }}
        />
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAdmission(null);
        }}
        title="Delete Admission Record"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete the admission record for{" "}
            <strong>
              {selectedAdmission?.first_name} {selectedAdmission?.last_name}
            </strong>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedAdmission(null);
              }}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="btn bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Admissions;
