import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { selectUserRole } from "../../store/slices/authSlice";
import {
    Plus, Search, Filter, AlertTriangle, CheckCircle, XCircle, MoreVertical, Edit, Trash2, X
} from "lucide-react";
import { disciplineAPI, studentsAPI } from "../../lib/api";
import Modal from "../../components/common/Modal";
import toast from "react-hot-toast";

const Discipline = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
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
            queryClient.invalidateQueries(["discipline"]);
        },
        onError: (error) => toast.error(error.message || "Failed to delete record"),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Add validation?

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

    const getSeverityColor = (severity) => {
        switch (severity) {
            case "critical": return "bg-red-100 text-red-800 border-red-200";
            case "high": return "bg-orange-100 text-orange-800 border-orange-200";
            case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "low": return "bg-green-100 text-green-800 border-green-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                        Discipline Management
                    </h1>
                    <p className="text-gray-600 mt-1">Track and manage student behavior and activities</p>
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

            {/* Filters */}
            <div className="card p-4 transition-all hover:shadow-md">
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

            {/* Content Grid */}
            {
                isLoading ? (
                    <div className="text-center py-12">
                        <div className="loading-spinner mb-4"></div>
                        <p className="text-gray-500">Loading discipline records...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {recordsData?.data?.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No records found</h3>
                                <p className="text-gray-500 mt-1">Try adjusting your filters or add a new record.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Incident</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Severity</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                                {userRole !== 'student' && (
                                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {recordsData?.data?.map((record) => (
                                                <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0">
                                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                                                    {record.student_name?.charAt(0)}
                                                                </div>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{record.student_name}</div>
                                                                <div className="text-xs text-gray-500">{record.class_name} • {record.admission_number}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900">{record.title}</div>
                                                        <div className="text-sm text-gray-500 truncate max-w-xs">{record.description}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getSeverityColor(record.severity)}`}>
                                                            {record.severity.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                                                            {record.status.replace("_", " ").toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {record.rating ? (
                                                            <div className="flex items-center">
                                                                <span className={`text-sm font-bold ${record.rating <= 4 ? 'text-red-600' :
                                                                    record.rating <= 7 ? 'text-yellow-600' : 'text-green-600'
                                                                    }`}>
                                                                    {record.rating}/10
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(record.created_at).toLocaleDateString()}
                                                    </td>
                                                    {userRole !== 'student' && (
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex items-center justify-end space-x-2">
                                                                <button
                                                                    onClick={() => openEditModal(record)}
                                                                    className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <Edit className="w-5 h-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(record.id)}
                                                                    className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )
            }

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
                            className="btn btn-ghost"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Record"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div >
    );
};

export default Discipline;
