import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter } from "lucide-react";
import { studentsAPI, classesAPI } from "../lib/api";
import StudentTable from "../components/students/StudentTable";
import StudentForm from "../components/common/StudentForm";
import Modal from "../components/common/Modal";
import PermissionGuard from "../components/common/PermissionGuard";
import { PERMISSIONS } from "../utils/rbac";
import toast from "react-hot-toast";

const Students = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    class_id: "",
    section_id: "",
    status: "active",
    search: "",
  });

  const queryClient = useQueryClient();

  // Fetch students
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ["students", filters],
    queryFn: () => studentsAPI.getAll(filters),
  });

  // Fetch classes
  const { data: classesData } = useQuery({
    queryKey: ["classes"],
    queryFn: classesAPI.getAll,
  });

  const handleAddStudent = async (formData) => {
    try {
      await studentsAPI.create(formData);
      toast.success("Student added successfully!");
      setShowAddModal(false);
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["class"] });
    } catch (error) {
      toast.error(error.message || "Failed to add student");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">Manage student information</p>
        </div>

        <PermissionGuard permission={PERMISSIONS.CREATE_STUDENTS}>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Student</span>
          </button>
        </PermissionGuard>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search students..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="input pl-10"
            />
          </div>

          {/* Class Filter */}
          <select
            value={filters.class_id}
            onChange={(e) =>
              setFilters({
                ...filters,
                class_id: e.target.value,
                section_id: "",
              })
            }
            className="input"
          >
            <option value="">All Classes</option>
            {classesData?.data?.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
            <option value="transferred">Transferred</option>
          </select>

          {/* Reset Button */}
          <button
            onClick={() =>
              setFilters({
                class_id: "",
                section_id: "",
                status: "active",
                search: "",
              })
            }
            className="btn btn-outline flex items-center justify-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Students Table */}
      <StudentTable students={studentsData?.data || []} isLoading={isLoading} />

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Student"
        size="md"
      >
        <StudentForm
          onSubmit={handleAddStudent}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </div>
  );
};

export default Students;
