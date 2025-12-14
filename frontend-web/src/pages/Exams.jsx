import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Calendar,
  BookOpen,
  FileText,
  Filter,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { examsAPI } from "../lib/api";
import Modal from "../components/common/Modal";
import ExamForm from "../components/common/ExamForm";
import ExamTable from "../components/exams/ExamTable";
import PermissionGuard from "../components/common/PermissionGuard";
import { PERMISSIONS } from "../utils/rbac";

import toast from "react-hot-toast";

const Exams = () => {
  const queryClient = useQueryClient();

  // Get current academic year for default selection
  const getCurrentAcademicYear = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    return currentMonth < 6
      ? `${currentYear - 1}-${currentYear}`
      : `${currentYear}-${currentYear + 1}`;
  };

  const [selectedAcademicYear, setSelectedAcademicYear] = useState(
    getCurrentAcademicYear()
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");

  // Fetch academic years from database
  const { data: academicYearsData } = useQuery({
    queryKey: ["academic-years"],
    queryFn: examsAPI.getAcademicYears,
  });

  const academicYears = academicYearsData?.data || [];

  // Update selected academic year when data loads or if current selection is invalid
  useEffect(() => {
    if (academicYears.length > 0 && !academicYears.includes(selectedAcademicYear)) {
      setSelectedAcademicYear(academicYears[0]);
    }
  }, [academicYears, selectedAcademicYear]);

  const { data: examsData, isLoading } = useQuery({
    queryKey: ["exams", selectedAcademicYear],
    queryFn: () => examsAPI.getAll({ academic_year: selectedAcademicYear }),
  });

  const exams = examsData?.data || [];

  // Filter exams by type
  const filteredExams = useMemo(() => {
    if (filterType === "all") return exams;
    return exams.filter((exam) => exam.exam_type === filterType);
  }, [exams, filterType]);

  // Create exam mutation
  const createMutation = useMutation({
    mutationFn: examsAPI.create,
    onSuccess: () => {
      toast.success("Exam created successfully");
      setIsModalOpen(false);
      queryClient.invalidateQueries(["exams"]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create exam");
    },
  });

  const handleSubmit = (formData) => {
    createMutation.mutate(formData);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: exams.length,
      completed: exams.filter((e) => new Date(e.end_date) < now).length,
      ongoing: exams.filter(
        (e) => new Date(e.start_date) <= now && new Date(e.end_date) >= now
      ).length,
      upcoming: exams.filter((e) => new Date(e.start_date) > now).length,
    };
  }, [exams]);

  const examTypes = [
    { value: "all", label: "All Exams", color: "text-black" },
    { value: "term", label: "Term", color: "text-black" },
    {
      value: "midterm",
      label: "Midterm",
      color: "text-black",
    },
    { value: "final", label: "Final", color: "text-black" },
    {
      value: "unit_test",
      label: "Unit Test",
      color: "text-black",
    },
    {
      value: "monthly",
      label: "Monthly",
      color: "text-black",
    },
    {
      value: "quarterly",
      label: "Quarterly",
      color: "text-black",
    },
    { value: "annual", label: "Annual", color: "text-black" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BookOpen className="w-8 h-8 mr-3 text-blue-600" />
            Examinations
          </h1>
          <p className="text-gray-600 mt-2">
            Manage exams, schedules, and results
          </p>
        </div>
        <PermissionGuard permissions={[PERMISSIONS.CREATE_EXAMS]}>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary flex items-center space-x-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="w-5 h-5" />
            <span>Create Exam</span>
          </button>
        </PermissionGuard>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-black opacity-90">Total Exams</h3>
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-4xl font-bold text-black">{stats.total}</p>
          <p className="text-xs text-black opacity-80 mt-2">In {selectedAcademicYear}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-black opacity-90">Completed</h3>
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-4xl font-bold text-black">{stats.completed}</p>
          <p className="text-xs text-black opacity-80 mt-2">
            {stats.total > 0
              ? Math.round((stats.completed / stats.total) * 100)
              : 0}
            % of total
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-black opacity-90">Ongoing</h3>
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-4xl font-bold text-black">{stats.ongoing}</p>
          <p className="text-xs text-black opacity-80 mt-2">Active right now</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-black opacity-90">Upcoming</h3>
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-4xl font-bold text-black">{stats.upcoming}</p>
          <p className="text-xs text-black opacity-80 mt-2">Scheduled ahead</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Academic Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Year
            </label>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="input w-full"
            >
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Type Filter */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam Type
            </label>
            <div className="flex flex-wrap gap-2">
              {examTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFilterType(type.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterType === type.value
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-black border border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  {type.label}
                  {type.value !== "all" && (
                    <span className="ml-2 text-xs opacity-75">
                      ({exams.filter((e) => e.exam_type === type.value).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(filterType !== "all" ||
          selectedAcademicYear !== getCurrentAcademicYear()) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Active filters:</span>
                  {selectedAcademicYear !== getCurrentAcademicYear() && (
                    <span className="px-2 py-1 bg-white text-black border border-blue-600 rounded-md font-medium">
                      {selectedAcademicYear}
                    </span>
                  )}
                  {filterType !== "all" && (
                    <span className="px-2 py-1 bg-blue-600 text-white rounded-md font-medium">
                      {examTypes.find((t) => t.value === filterType)?.label}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedAcademicYear(getCurrentAcademicYear());
                    setFilterType("all");
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
      </div>



      {/* Exams List */}
      <ExamTable
        exams={filteredExams}
        isLoading={isLoading}
        onRefetch={() => queryClient.invalidateQueries(["exams"])}
      />

      {/* Create Exam Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Exam"
        size="lg"
      >
        <ExamForm
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={createMutation.isPending}
        />
      </Modal>
    </div>
  );
};

export default Exams;
