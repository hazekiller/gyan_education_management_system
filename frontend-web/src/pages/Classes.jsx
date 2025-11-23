import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter } from "lucide-react";
import { classesAPI, teachersAPI } from "../lib/api";
import ClassTable from "../components/classes/ClassTable";
import ClassForm from "../components/common/ClassForm";
import Modal from "../components/common/Modal";
import PermissionGuard from "../components/common/PermissionGuard";
import { PERMISSIONS } from "../utils/rbac";
import toast from "react-hot-toast";

const Classes = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
  });

  // Fetch classes
  const {
    data: classesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["classes", filters],
    queryFn: () => classesAPI.getAll(filters),
  });

  // Fetch teachers for form
  const { data: teachersData } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => teachersAPI.getAll({ limit: 1000 }),
  });

  const handleAddClass = async (formData) => {
    try {
      await classesAPI.create(formData);
      toast.success("Class added successfully!");
      setShowAddModal(false);
      refetch();
    } catch (error) {
      toast.error(error.message || "Failed to add class");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-600 mt-1">Manage classes and sections</p>
        </div>

        <PermissionGuard permission={PERMISSIONS.CREATE_CLASSES}>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Class</span>
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
              placeholder="Search classes..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="input pl-10"
            />
          </div>

          {/* Reset Button */}
          <button
            onClick={() => setFilters({ search: "" })}
            className="btn btn-outline flex items-center justify-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Classes Table */}
      <ClassTable
        classes={classesData?.data || []}
        isLoading={isLoading}
        onRefetch={refetch}
        teachers={teachersData?.data || []}
      />

      {/* Add Class Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Class"
        size="large"
      >
        <ClassForm
          onSubmit={handleAddClass}
          onCancel={() => setShowAddModal(false)}
          teachers={teachersData?.data || []}
        />
      </Modal>
    </div>
  );
};

export default Classes;
