import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { selectUserRole } from "../../store/slices/authSlice";
import {
    Plus, Search, Filter, AlertTriangle, CheckCircle, XCircle, Edit, Trash2, ChevronRight, 
    Clock, TrendingUp, FileText, Shield
} from "lucide-react";
import { disciplineAPI, studentsAPI } from "../../lib/api";
import Modal from "../../components/common/Modal";
import toast from "react-hot-toast";

const Discipline = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [viewRecord, setViewRecord] = useState(null);
    const [filters, setFilters] = useState({
        status: "",
        severity: "",
        search: "",
    });

    const queryClient = useQueryClient();
    const userRole = useSelector(selectUserRole);

    // Fetch discipline records
    const { data: recordsData, isLoading } = useQuery({
        queryKey: ["discipline", filters],
        queryFn: () => disciplineAPI.getAll(filters),
    });

    // Fetch students for the form
    const { data: studentsData } = useQuery({
        queryKey: ["students-list"],
        queryFn: () => studentsAPI.getAll({ status: 'active' }),
    });

    // Calculate statistics
    const statistics = useMemo(() => {
        const records = recordsData?.data || [];
        return {
            total: records.length,
            pending: records.filter(r => r.status === 'pending').length,
            resolved: records.filter(r => r.status === 'resolved').length,
            critical: records.filter(r => r.severity === 'critical').length,
        };
    }, [recordsData]);

    // Mutations
    const createMutation = useMutation({
        mutationFn: disciplineAPI.create,
        onSuccess: () => {
            toast.success("Record created successfully");
            setShowAddModal(false);
            queryClient.invalidateQueries(["discipline"]);
        },
        onError: (error) => toast.error(error.message || "Failed to create record"),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => disciplineAPI.update(id, data),
        onSuccess: () => {
            toast.success("Record updated successfully");
            setShowAddModal(false);
            setSelectedRecord(null);
            setIsEditMode(false);
            queryClient.invalidateQueries(["discipline"]);
        },
        onError: (error) => toast.error(error.message || "Failed to update record"),
    });

    const deleteMutation = useMutation({
        mutationFn: disciplineAPI.delete,
        onSuccess: () => {
            toast.success("Record deleted successfully");
            setViewRecord(null);
            queryClient.invalidateQueries(["discipline"]);
        },
        onError: (error) => toast.error(error.message || "Failed to delete record"),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        if (isEditMode && selectedRecord) {
            updateMutation.mutate({ id: selectedRecord.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const openEditModal = (record) => {
        setSelectedRecord(record);
        setIsEditMode(true);
        setShowAddModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            deleteMutation.mutate(id);
        }
    };

    const handleRecordClick = (record) => {
        setViewRecord(record);
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case "critical": return "bg-red-100 text-red-800 border-red-200";
            case "high": return "bg-orange-100 text-orange-800 border-orange-200";
            case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "low": return "bg-green-100 text-green-800 border-green-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getSeverityBgColor = (severity) => {
        switch (severity) {
            case "critical": return "from-red-500 to-red-600";
            case "high": return "from-orange-500 to-orange-600";
            case "medium": return "from-yellow-500 to-yellow-600";
            case "low": return "from-green-500 to-green-600";
            default: return "from-gray-500 to-gray-600";
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "resolved": return "bg-green-100 text-green-800";
            case "dismissed": return "bg-gray-100 text-gray-800";
            case "pending": return "bg-yellow-100 text-yellow-800";
            default: return "bg-blue-100 text-blue-800";
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Shield className="w-8 h-8 text-blue-600" />
                            Discipline Management
                        </h1>
                        <p className="text-gray-600 mt-1">Track and manage student behavior records</p>
                    </div>
                </div>

                {/* Loading State */}
                <div className="flex h-screen bg-gray-50">
                    <div className="w-96 bg-white border-r border-gray-200 p-4">
                        <div className="animate-pulse space-y-3">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 p-8">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                            <div className="h-64 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="w-8 h-8 text-blue-600" />
                        Discipline Management
                    </h1>
                    <p className="text-gray-600 mt-1">Track and manage student behavior records</p>
                </div>

                {userRole !== 'student' && (
                    <button
                        onClick={() => {
                            setSelectedRecord(null);
                            setIsEditMode(false);
                            setShowAddModal(true);
                        }}
                        className="btn btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Record</span>
                    </button>
                )}
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Records</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-3xl font-bold text-yellow-600 mt-2">{statistics.pending}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Resolved</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">{statistics.resolved}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Critical</p>
                            <p className="text-3xl font-bold text-red-600 mt-2">{statistics.critical}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="input pl-10 w-full"
                        />
                    </div>

                    <select
                        value={filters.severity}
                        onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                        className="input w-full"
                    >
                        <option value="">All Severities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="input w-full"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                    </select>

                    <button
                        onClick={() => setFilters({ status: "", severity: "", search: "" })}
                        className="btn btn-outline flex items-center justify-center gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        <span>Reset Filters</span>
                    </button>
                </div>
            </div>

            {/* Main Content - Sidebar Layout */}
            {recordsData?.data?.length === 0 ? (
                <div className="flex h-96 bg-white rounded-xl shadow-sm border border-gray-200 items-center justify-center">
                    <div className="text-center">
                        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Records Found</h3>
                        <p className="text-gray-500">Try adjusting your filters or add a new record.</p>
                    </div>
                </div>
            ) : (
                <div className="flex h-[600px] bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                    {/* Sidebar - Records List */}
                    <div className="w-96 bg-white border-r border-gray-300 overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-gray-900">Records</h2>
                            <p className="text-sm text-gray-600 mt-1">{recordsData?.data?.length} Total</p>
                        </div>

                        <div className="p-4 space-y-2">
                            {recordsData?.data?.map((record) => (
                                <div
                                    key={record.id}
                                    onClick={() => handleRecordClick(record)}
                                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                                        viewRecord?.id === record.id
                                            ? "bg-blue-50 border-blue-500 shadow-md"
                                            : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                viewRecord?.id === record.id
                                                    ? "bg-blue-500"
                                                    : "bg-gradient-to-br from-blue-500 to-purple-600"
                                            }`}>
                                                <span className="text-white font-bold text-sm">
                                                    {record.student_name?.charAt(0)}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold text-gray-900 truncate">
                                                    {record.student_name}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    {record.class_name}
                                                </div>
                                                <div className="text-sm text-gray-700 mt-1 truncate">
                                                    {record.title}
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSeverityColor(record.severity)}`}>
                                                        {record.severity}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(record.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-transform ${
                                            viewRecord?.id === record.id
                                                ? "text-blue-500 transform translate-x-1"
                                                : "text-gray-400"
                                        }`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Panel - Record Details */}
                    <div className="flex-1 overflow-y-auto bg-gray-50">
                        {viewRecord ? (
                            <div className="p-8">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    {/* Header */}
                                    <div className={`bg-gradient-to-r ${getSeverityBgColor(viewRecord.severity)} p-6 text-white`}>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold uppercase">
                                                        {viewRecord.severity}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(viewRecord.status)}`}>
                                                        {viewRecord.status}
                                                    </span>
                                                </div>
                                                <h1 className="text-2xl font-bold">{viewRecord.title}</h1>
                                                <p className="text-white/90 mt-2">{viewRecord.category}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Student Info */}
                                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                                                {viewRecord.student_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{viewRecord.student_name}</h3>
                                                <p className="text-sm text-gray-600">{viewRecord.class_name} • {viewRecord.admission_number}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="p-6 grid grid-cols-2 gap-6">
                                        {/* Description */}
                                        <div className="col-span-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                Description
                                            </div>
                                            <p className="text-sm text-gray-900">
                                                {viewRecord.description || "No description provided"}
                                            </p>
                                        </div>

                                        {/* Action Taken */}
                                        {viewRecord.action_taken && (
                                            <div className="col-span-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                    Action Taken
                                                </div>
                                                <p className="text-sm text-gray-900">{viewRecord.action_taken}</p>
                                            </div>
                                        )}

                                        {/* Rating */}
                                        {viewRecord.rating && (
                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                    Behavior Rating
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`text-2xl font-bold ${
                                                        viewRecord.rating <= 4 ? 'text-red-600' :
                                                        viewRecord.rating <= 7 ? 'text-yellow-600' : 'text-green-600'
                                                    }`}>
                                                        {viewRecord.rating}/10
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Date */}
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                Date Recorded
                                            </div>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {new Date(viewRecord.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {userRole !== 'student' && (
                                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                                    Actions
                                                </h3>
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => openEditModal(viewRecord)}
                                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                        <span>Edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(viewRecord.id)}
                                                        className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors shadow-sm"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        <span>Delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <Shield className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                        Select a Record
                                    </h3>
                                    <p className="text-gray-500">
                                        Choose a record from the sidebar to view details
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={isEditMode ? "Edit Discipline Record" : "Add Discipline Record"}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {!isEditMode && (
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Student *</label>
                                <select
                                    name="student_id"
                                    required
                                    className="input"
                                >
                                    <option value="">Select a student...</option>
                                    {studentsData?.data?.map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {student.first_name} {student.last_name} ({student.class_name})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title/Incident *</label>
                            <input
                                type="text"
                                name="title"
                                defaultValue={selectedRecord?.title}
                                required
                                className="input"
                                placeholder="e.g., Fighting in class, Homework not done"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                name="category"
                                defaultValue={selectedRecord?.category || "behavior"}
                                className="input"
                            >
                                <option value="behavior">Behavior</option>
                                <option value="activity">Activity</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                            <select
                                name="severity"
                                defaultValue={selectedRecord?.severity || "low"}
                                className="input"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                name="status"
                                defaultValue={selectedRecord?.status || "pending"}
                                className="input"
                            >
                                <option value="pending">Pending</option>
                                <option value="resolved">Resolved</option>
                                <option value="dismissed">Dismissed</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-10)</label>
                            <input
                                type="number"
                                name="rating"
                                min="1"
                                max="10"
                                defaultValue={selectedRecord?.rating}
                                className="input"
                                placeholder="Rate behavior/activity"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                defaultValue={selectedRecord?.description}
                                rows="3"
                                className="input"
                                placeholder="Detailed description of the incident..."
                            ></textarea>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Action Taken</label>
                            <textarea
                                name="action_taken"
                                defaultValue={selectedRecord?.action_taken}
                                rows="2"
                                className="input"
                                placeholder="What action was taken?"
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Record"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Discipline;
