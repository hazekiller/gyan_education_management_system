import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  FileText,
  UserPlus,
} from "lucide-react";
import { admissionsAPI } from "../lib/api";
import Modal from "../components/common/Modal";
import AdmissionForm from "../components/admissions/AdmissionForm";
import PermissionGuard from "../components/common/PermissionGuard";
import { PERMISSIONS } from "../utils/rbac";
import toast from "react-hot-toast";

const Admissions = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
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
      const response = await admissionsAPI.update(selectedAdmission.id, formData);
      toast.success("Admission updated successfully");

      // Check if status changed to 'approved' or 'admitted' and auto-convert
      if ((formData.status === 'approved' || formData.status === 'admitted') &&
        selectedAdmission.status !== 'approved' &&
        selectedAdmission.status !== 'admitted' &&
        !selectedAdmission.student_id) {
        toast.loading("Converting admission to student...", { duration: 2000 });
        await handleConvertToStudent(selectedAdmission.id);
      }

      setShowEditModal(false);
      setSelectedAdmission(null);
      queryClient.invalidateQueries(["admissions"]);
      queryClient.invalidateQueries(["students"]);
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

  const handleConvertToStudent = async (admissionId) => {
    try {
      await admissionsAPI.convertToStudent(admissionId || selectedAdmission.id);
      toast.success("Student created successfully from admission!");
      setShowConvertModal(false);
      setSelectedAdmission(null);
      queryClient.invalidateQueries(["admissions"]);
      queryClient.invalidateQueries(["students"]);
      queryClient.invalidateQueries(["classes"]);

      // Redirect to Students page
      navigate("/users");
    } catch (error) {
      toast.error(error.message || "Failed to convert admission to student");
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
        className={`px-2 py-1 text-xs rounded-full font-medium ${styles[status] || "bg-gray-100 text-gray-800"
          }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Admissions</h1>
          <p className="text-gray-600 mt-1 max-w-md">
            Manage student admission applications with ease.
          </p>
        </div>
        <PermissionGuard permission={PERMISSIONS.MANAGE_ADMISSIONS}>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            <span>New Admission</span>
          </button>
        </PermissionGuard>
      </div>

      {/* Filters */}
      <div className="card p-6 bg-white rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <div className="relative md:col-span-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, application number..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input pl-12 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
            className="input w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="admitted">Admitted</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            onClick={() => setFilters({ search: "", status: "" })}
            className="btn btn-outline flex items-center justify-center space-x-2 rounded-lg border border-gray-300 hover:bg-gray-50 px-4 py-2"
          >
            <Filter className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden rounded-lg shadow-sm bg-white border border-gray-200">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-gray-50 border-b border-gray-300 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-48">
                  Application No
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  colSpan={5}
                >
                  Details
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
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
                  <tr
                    key={admission.id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    {/* LEFT SIDE — APPLICATION NUMBER */}
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 border-r border-gray-200 align-middle whitespace-nowrap">
                      {admission.application_number}
                    </td>

                    {/* RIGHT SIDE — DETAILS */}
                    <td colSpan={5} className="px-6 py-4 align-middle">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm text-gray-700">
                        {/* Student Info */}
                        <div>
                          <p className="font-medium text-gray-900 truncate">
                            {admission.first_name} {admission.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {admission.gender}
                          </p>
                        </div>

                        {/* Class */}
                        <div className="truncate">
                          <p>{admission.class_name}</p>
                        </div>

                        {/* Parent */}
                        <div>
                          <p className="font-semibold truncate">
                            {admission.parent_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {admission.parent_phone}
                          </p>
                        </div>

                        {/* Date + Status */}
                        <div>
                          <p>
                            {new Date(
                              admission.application_date
                            ).toLocaleDateString()}
                          </p>
                          <div className="mt-1">
                            {getStatusBadge(admission.status)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 whitespace-nowrap text-right align-middle text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <PermissionGuard
                          permission={PERMISSIONS.MANAGE_ADMISSIONS}
                        >
                          {/* Show Convert button only for approved/admitted status */}
                          {(admission.status === 'approved' || admission.status === 'admitted') && !admission.student_id && (
                            <button
                              onClick={() => {
                                setSelectedAdmission(admission);
                                setShowConvertModal(true);
                              }}
                              className="text-green-600 hover:text-green-800 transition-colors rounded p-1"
                              title="Convert to Student"
                              aria-label={`Convert admission ${admission.application_number} to student`}
                            >
                              <UserPlus className="w-5 h-5" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedAdmission(admission);
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 transition-colors rounded p-1"
                            title="Edit"
                            aria-label={`Edit admission ${admission.application_number}`}
                          >
                            <Edit className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedAdmission(admission);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-800 transition-colors rounded p-1"
                            title="Delete"
                            aria-label={`Delete admission ${admission.application_number}`}
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
        size="md"
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
        size="md"
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

      {/* Convert to Student Modal */}
      <Modal
        isOpen={showConvertModal}
        onClose={() => {
          setShowConvertModal(false);
          setSelectedAdmission(null);
        }}
        title="Convert to Student"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              This will create a new student record with the following details:
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <p><strong>Name:</strong> {selectedAdmission?.first_name} {selectedAdmission?.last_name}</p>
              <p><strong>Class:</strong> {selectedAdmission?.class_name}</p>
              <p><strong>Parent:</strong> {selectedAdmission?.parent_name}</p>
              <p><strong>Phone:</strong> {selectedAdmission?.parent_phone}</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            The student will be added to the Students page and will be able to access the system.
            Are you sure you want to proceed?
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setShowConvertModal(false);
                setSelectedAdmission(null);
              }}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={() => handleConvertToStudent()}
              className="btn bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Convert to Student</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Admissions;