// src/pages/Subjects.jsx
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter } from "lucide-react";
import { subjectsAPI } from "../lib/api";
import SubjectTable from "../components/subjects/SubjectTable";
import SubjectForm from "../components/subjects/SubjectForm";
import Modal from "../components/common/Modal";
import PermissionGuard from "../components/common/PermissionGuard";
import { PERMISSIONS } from "../utils/rbac";
import toast from "react-hot-toast";

const Subjects = () => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "active",
    search: "",
  });

  // Fetch subjects
  const { data: subjectsData, isLoading } = useQuery({
    queryKey: ["subjects", filters],
    queryFn: () => subjectsAPI.getAll(filters),
  });

  const handleAddSubject = async (formData) => {
    try {
      await subjectsAPI.create(formData);
      toast.success("Subject added successfully!");
      setShowAddModal(false);
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    } catch (error) {
      toast.error(error.message || "Failed to add subject");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-600 mt-1">Manage school subjects</p>
        </div>

        <PermissionGuard permission={PERMISSIONS.MANAGE_CLASS_SUBJECTS}>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Subject</span>
          </button>
        </PermissionGuard>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="input pl-10"
            />
          </div>

          {/* Reset Button */}
          <button
            onClick={() => setFilters({ status: "active", search: "" })}
            className="btn btn-outline flex items-center justify-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Subjects Table */}
      <SubjectTable subjects={subjectsData?.data || []} isLoading={isLoading} />

      {/* Add Subject Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Subject"
        size="md"
      >
        <SubjectForm
          onSubmit={handleAddSubject}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  );
};

export default Subjects;
