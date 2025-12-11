import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Edit,
    Trash2,
    Eye,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Award,
    Briefcase,
    ChevronRight,
    GraduationCap
} from "lucide-react";
import { teachersAPI } from "../../lib/api";
import Modal from "../common/Modal";
import TeacherForm from "../common/TeacherForm";
import toast from "react-hot-toast";

const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "http://localhost:5000";

const TeacherTable = ({ teachers, isLoading, onUpdate }) => {
    const navigate = useNavigate();
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [editTeacher, setEditTeacher] = useState(null);
    const [deleteTeacher, setDeleteTeacher] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Select the first teacher by default when data loads
    useEffect(() => {
        if (teachers && teachers.length > 0 && !selectedTeacher) {
            setSelectedTeacher(teachers[0]);
        } else if (!teachers || teachers.length === 0) {
            setSelectedTeacher(null);
        }
    }, [teachers, selectedTeacher]);

    const handleTeacherClick = (teacher) => {
        setSelectedTeacher(teacher);
    };

    const handleEdit = (teacher) => {
        setEditTeacher(teacher);
        setShowEditModal(true);
    };

    const handleDelete = (teacher) => {
        setDeleteTeacher(teacher);
        setShowDeleteModal(true);
    };

    const handleUpdateTeacher = async (formData) => {
        try {
            await teachersAPI.update(editTeacher.id, formData);
            toast.success("Teacher updated successfully!");
            setShowEditModal(false);
            setEditTeacher(null);
            if (onUpdate) onUpdate();

            // Update selected teacher if it was the one edited
            if (selectedTeacher && selectedTeacher.id === editTeacher.id) {
                setSelectedTeacher({ ...selectedTeacher, ...formData });
            }
        } catch (error) {
            toast.error(error.message || "Failed to update teacher");
        }
    };

    const confirmDelete = async () => {
        try {
            await teachersAPI.delete(deleteTeacher.id);
            toast.success("Teacher deleted successfully!");
            setShowDeleteModal(false);
            setDeleteTeacher(null);

            if (selectedTeacher && selectedTeacher.id === deleteTeacher.id) {
                setSelectedTeacher(null);
            }

            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error(error.message || "Failed to delete teacher");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen bg-gray-50">
                <div className="w-80 bg-white border-r border-gray-200 p-4">
                    <div className="animate-pulse space-y-3">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
                <div className="flex-1 p-8">
                    <div className="animate-pulse">
                        <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="h-40 bg-gray-200 rounded"></div>
                            <div className="h-40 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!teachers || teachers.length === 0) {
        return (
            <div className="flex h-[calc(100vh-200px)] bg-gray-50 items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No teachers found</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex h-[calc(100vh-200px)] bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {/* Sidebar - Teacher List */}
                <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10 backdrop-blur-sm">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                            Staff Directory ({teachers.length})
                        </h2>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {teachers.map((teacher) => (
                            <div
                                key={teacher.id}
                                onClick={() => handleTeacherClick(teacher)}
                                className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${selectedTeacher?.id === teacher.id
                                        ? "bg-blue-50 border-l-4 border-blue-500"
                                        : "border-l-4 border-transparent"
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                            {teacher.profile_photo ? (
                                                <img
                                                    src={`${IMAGE_URL}/${teacher.profile_photo}`}
                                                    alt={teacher.first_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-sm font-bold text-gray-500">
                                                    {teacher.first_name.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${teacher.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                                            }`}></span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className={`text-sm font-medium truncate ${selectedTeacher?.id === teacher.id ? 'text-blue-700' : 'text-gray-900'
                                            }`}>
                                            {teacher.first_name} {teacher.last_name}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                            {teacher.employee_id}
                                        </div>
                                    </div>

                                    {selectedTeacher?.id === teacher.id && (
                                        <ChevronRight className="w-4 h-4 text-blue-500" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content - Teacher Details */}
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    {selectedTeacher ? (
                        <div className="relative">
                            {/* Profile Header */}
                            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>

                            <div className="px-8 pb-8">
                                <div className="relative flex items-end -mt-12 mb-6 space-x-5">
                                    <div className="w-32 h-32 rounded-xl bg-white p-1 shadow-lg">
                                        <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {selectedTeacher.profile_photo ? (
                                                <img
                                                    src={`${IMAGE_URL}/${selectedTeacher.profile_photo}`}
                                                    alt={selectedTeacher.first_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-12 h-12 text-gray-300" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 pb-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h1 className="text-2xl font-bold text-gray-900">
                                                    {selectedTeacher.first_name} {selectedTeacher.middle_name} {selectedTeacher.last_name}
                                                </h1>
                                                <p className="text-gray-600 flex items-center space-x-2">
                                                    <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                                        {selectedTeacher.employee_id}
                                                    </span>
                                                    {selectedTeacher.specialization && (
                                                        <>
                                                            <span className="text-gray-300">•</span>
                                                            <span className="text-blue-600 font-medium">{selectedTeacher.specialization}</span>
                                                        </>
                                                    )}
                                                </p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${selectedTeacher.status === 'active'
                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                        : 'bg-gray-100 text-gray-600 border-gray-200'
                                                    }`}>
                                                    <span className={`w-2 h-2 rounded-full inline-block mr-2 ${selectedTeacher.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                                                        }`}></span>
                                                    <span className="capitalize">{selectedTeacher.status}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Bar */}
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
                                    <div className="flex space-x-8">
                                        <button className="text-blue-600 font-medium border-b-2 border-blue-600 pb-6 -mb-6.5">
                                            Overview
                                        </button>
                                        <button
                                            onClick={() => navigate(`/teachers/${selectedTeacher.id}`)}
                                            className="text-gray-500 hover:text-gray-800 font-medium pb-6 -mb-6.5 transition-colors"
                                        >
                                            Full Profile
                                        </button>
                                        <button className="text-gray-500 hover:text-gray-800 font-medium pb-6 -mb-6.5 transition-colors">
                                            Schedule
                                        </button>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleEdit(selectedTeacher)}
                                            className="btn btn-sm btn-outline flex items-center space-x-1"
                                        >
                                            <Edit className="w-4 h-4" />
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(selectedTeacher)}
                                            className="btn btn-sm text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 flex items-center space-x-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Info Grid */}
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Contact Info */}
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                                            <Mail className="w-5 h-5 mr-2 text-gray-400" />
                                            Contact Information
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                                                <p className="text-gray-900 mt-1">{selectedTeacher.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</p>
                                                <p className="text-gray-900 mt-1">{selectedTeacher.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</p>
                                                <p className="text-gray-900 mt-1">
                                                    {selectedTeacher.address || "N/A"}
                                                    {selectedTeacher.city && `, ${selectedTeacher.city}`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Professional Info */}
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                                            <Briefcase className="w-5 h-5 mr-2 text-gray-400" />
                                            Employment Details
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Qualification</p>
                                                    <p className="text-gray-900 mt-1 flex items-center">
                                                        <GraduationCap className="w-4 h-4 mr-1 text-gray-400" />
                                                        {selectedTeacher.qualification || "N/A"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Experience</p>
                                                    <p className="text-gray-900 mt-1">
                                                        {selectedTeacher.experience_years ? `${selectedTeacher.experience_years} Years` : "N/A"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Join Date</p>
                                                <p className="text-gray-900 mt-1">
                                                    {selectedTeacher.joining_date
                                                        ? new Date(selectedTeacher.joining_date).toLocaleDateString()
                                                        : "N/A"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</p>
                                                <span className="inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                    {selectedTeacher.employment_type === 'full_time' ? 'Full Time' : 'Part Time'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <User className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">No Teacher Selected</h3>
                            <p className="text-gray-500 max-w-sm mt-2">
                                Select a teacher from the list to view their details, schedule, and assignments.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditTeacher(null);
                }}
                title="Edit Teacher"
                size="lg"
            >
                <TeacherForm
                    teacher={editTeacher}
                    onSubmit={handleUpdateTeacher}
                    onCancel={() => {
                        setShowEditModal(false);
                        setEditTeacher(null);
                    }}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeleteTeacher(null);
                }}
                title="Delete Teacher"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to delete <strong>{deleteTeacher?.first_name} {deleteTeacher?.last_name}</strong>?
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={() => {
                                setShowDeleteModal(false);
                                setDeleteTeacher(null);
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

export default TeacherTable;
