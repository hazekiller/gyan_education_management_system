import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  FileText,
  Calendar,
  Clock,
  User,
  Edit,
  Trash2,
  Eye,
  X,
} from "lucide-react";
import { assignmentsAPI, authAPI } from "../lib/api";
import Modal from "../components/common/Modal";
import AssignmentForm from "../components/common/AssignmentForm";
import toast from "react-hot-toast";
import PermissionGuard from "../components/common/PermissionGuard";
import { PERMISSIONS } from "../utils/rbac";


const Assignments = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Advanced filters from navigation state
  const [advancedFilters, setAdvancedFilters] = useState({
    subject_id: null,
    class_id: null,
    section_id: null,
  });

  useEffect(() => {
    if (location.state) {
      if (location.state.filter) {
        setFilter(location.state.filter);
      }
      setAdvancedFilters({
        subject_id: location.state.subject_id || null,
        class_id: location.state.class_id || null,
        section_id: location.state.section_id || null,
      });
    }
  }, [location.state]);

  const [initialFormValues, setInitialFormValues] = useState(null);

  useEffect(() => {
    if (location.state?.openCreateModal) {
      setInitialFormValues({
        subject_id: location.state.subject_id,
        class_id: location.state.class_id,
        section_id: location.state.section_id,
      });
      setIsModalOpen(true);
      // Clear state to prevent reopening on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  // Get user profile to determine role
  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: authAPI.getProfile,
  });

  const userRole = profileData?.data?.role;

  const { data: assignmentsData, isLoading } = useQuery({
    queryKey: ["assignments", advancedFilters],
    queryFn: () => assignmentsAPI.getAll(advancedFilters),
  });

  const assignments = assignmentsData?.data || [];

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      subject_id: null,
      class_id: null,
      section_id: null,
    });
    // Clear location state
    navigate(location.pathname, { replace: true, state: {} });
  };

  // Create assignment mutation
  const createMutation = useMutation({
    mutationFn: assignmentsAPI.create,
    onSuccess: () => {
      toast.success("Assignment created successfully");
      setIsModalOpen(false);
      queryClient.invalidateQueries(["assignments"]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create assignment");
    },
  });

  // Update assignment mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => assignmentsAPI.update(id, data),
    onSuccess: () => {
      toast.success("Assignment updated successfully");
      setIsModalOpen(false);
      setEditingAssignment(null);
      queryClient.invalidateQueries(["assignments"]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update assignment");
    },
  });

  // Delete assignment mutation
  const deleteMutation = useMutation({
    mutationFn: assignmentsAPI.delete,
    onSuccess: () => {
      toast.success("Assignment deleted successfully");
      setDeletingId(null);
      queryClient.invalidateQueries(["assignments"]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete assignment");
      setDeletingId(null);
    },
  });

  const handleSubmit = (formData) => {
    if (editingAssignment) {
      updateMutation.mutate({ id: editingAssignment.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      setDeletingId(id);
      deleteMutation.mutate(id);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingAssignment(null);
  };

  const getStatusColor = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return "text-red-600";
    if (daysUntilDue <= 3) return "text-orange-600";
    return "text-green-600";
  };

  const filteredAssignments = assignments.filter((assignment) => {
    if (filter === "all") return true;
    const now = new Date();
    const due = new Date(assignment.due_date);

    if (filter === "upcoming") return due > now;
    if (filter === "overdue") return due < now;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 mt-1">
            {userRole === "admin" || userRole === "super_admin"
              ? "Manage homework and assignments for teachers"
              : "Manage homework and assignments"}
          </p>
        </div>
        <PermissionGuard permissions={[PERMISSIONS.CREATE_ASSIGNMENTS]}>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>
              {userRole === "admin" || userRole === "super_admin"
                ? "Create Assignment (as Teacher)"
                : "Create Assignment"}
            </span>
          </button>
        </PermissionGuard>
      </div>

      {/* Admin Notice */}
      {(userRole === "admin" || userRole === "super_admin") && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <User className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900">
                Admin Mode
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                As an admin, you can create assignments on behalf of any
                teacher. Select the teacher when creating a new assignment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            All Assignments
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === "upcoming"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter("overdue")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === "overdue"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Overdue
          </button>
        </div>

        {/* Active Advanced Filters Indicator */}
        {(advancedFilters.subject_id ||
          advancedFilters.class_id ||
          advancedFilters.section_id) && (
            <div className="mt-4 flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="text-sm text-blue-800">
                <span className="font-semibold">Filtered by:</span>
                {advancedFilters.subject_id && " Subject"}
                {advancedFilters.class_id && " • Class"}
                {advancedFilters.section_id && " • Section"}
              </div>
              <button
                onClick={clearAdvancedFilters}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          )}
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
          {/* <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            Create First Assignment
          </button> */}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => {
            const canEdit =
              userRole === "super_admin" ||
              userRole === "admin" ||
              userRole === "teacher";
            const canDelete =
              userRole === "super_admin" || userRole === "admin";

            return (
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
                          {assignment.class_name} - {assignment.section_name}
                          {assignment.subject_name &&
                            ` • ${assignment.subject_name}`}
                        </p>
                      </div>
                    </div>

                    {assignment.description && (
                      <p className="text-gray-700 mt-2 mb-4 line-clamp-2">
                        {assignment.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          Due:{" "}
                          {new Date(assignment.due_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock
                          className={`w-4 h-4 ${getStatusColor(
                            assignment.due_date
                          )}`}
                        />
                        <span className={getStatusColor(assignment.due_date)}>
                          {(() => {
                            const days = Math.ceil(
                              (new Date(assignment.due_date) - new Date()) /
                              (1000 * 60 * 60 * 24)
                            );
                            if (days < 0)
                              return `${Math.abs(days)} days overdue`;
                            return `${days} days left`;
                          })()}
                        </span>
                      </div>
                      <div className="text-gray-600">
                        Total Marks:{" "}
                        <span className="font-semibold">
                          {assignment.total_marks}
                        </span>
                      </div>
                    </div>

                    {/* Show attachments count if any */}
                    {assignment.attachments &&
                      assignment.attachments.length > 0 && (
                        <div className="mt-3 flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {assignment.attachments.length} attachment(s)
                          </span>
                        </div>
                      )}
                  </div>

                  <div className="ml-4 flex flex-col space-y-2">
                    <button
                      onClick={() => navigate(`/assignments/${assignment.id}`)}
                      className="btn btn-outline flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>

                    {canEdit && (
                      <button
                        onClick={() => handleEdit(assignment)}
                        className="btn btn-outline flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => handleDelete(assignment.id)}
                        className="btn btn-danger flex items-center space-x-2"
                        disabled={deletingId === assignment.id}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>
                          {deletingId === assignment.id
                            ? "Deleting..."
                            : "Delete"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
              {
                assignments.filter((a) => new Date(a.due_date) > new Date())
                  .length
              }
            </p>
            <p className="text-sm text-gray-600">Upcoming</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {
                assignments.filter((a) => new Date(a.due_date) < new Date())
                  .length
              }
            </p>
            <p className="text-sm text-gray-600">Overdue</p>
          </div>
        </div>
      </div>

      {/* Create/Edit Assignment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={
          editingAssignment
            ? "Edit Assignment"
            : userRole === "admin" || userRole === "super_admin"
              ? "Create Assignment (as Teacher)"
              : "Create New Assignment"
        }
        size="lg"
      >
        <AssignmentForm
          assignment={editingAssignment}
          initialValues={initialFormValues}
          onSubmit={handleSubmit}
          onCancel={() => {
            handleModalClose();
            setInitialFormValues(null);
          }}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </div>
  );
};

export default Assignments;
