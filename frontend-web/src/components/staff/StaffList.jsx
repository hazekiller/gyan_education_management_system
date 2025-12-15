import { useState, useEffect } from "react";
import { User, Mail, Phone, Briefcase, GraduationCap, ChevronRight, Edit, Trash2, Plus, X } from "lucide-react";
import { staffAPI } from "../../lib/api";
import toast from "react-hot-toast";
import StaffForm from "./StaffForm";

const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "http://localhost:5002";

const StaffList = ({ searchTerm }) => {
    const [staffs, setStaffs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch staff
    useEffect(() => {
        const fetchStaff = async () => {
            setIsLoading(true);
            try {
                const response = await staffAPI.getAll({ search: searchTerm });
                setStaffs(response.data || []);
                if (response.data && response.data.length > 0) {
                    setSelectedStaff(response.data[0]);
                }
            } catch (error) {
                console.error("Failed to fetch staff:", error);
                toast.error("Failed to load staff list");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStaff();
    }, [searchTerm]);

    const handleStaffClick = (staff) => {
        setSelectedStaff(staff);
    };

    const handleAddStaff = () => {
        setEditingStaff(null);
        setIsModalOpen(true);
    };

    const handleEditStaff = (staff) => {
        setEditingStaff(staff);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingStaff(null);
    };

    const handleFormSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            if (editingStaff) {
                await staffAPI.update(editingStaff.id, formData);
                toast.success('Staff updated successfully');
            } else {
                await staffAPI.create(formData);
                toast.success('Staff added successfully');
            }

            // Refresh staff list
            const response = await staffAPI.getAll({ search: searchTerm });
            setStaffs(response.data || []);

            // Update selected staff if editing
            if (editingStaff && selectedStaff?.id === editingStaff.id) {
                const updatedStaff = response.data.find(s => s.id === editingStaff.id);
                setSelectedStaff(updatedStaff);
            }

            handleCloseModal();
        } catch (error) {
            console.error('Failed to save staff:', error);
            toast.error(error.message || 'Failed to save staff');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteStaff = async (staffId) => {
        if (!window.confirm('Are you sure you want to delete this staff member?')) {
            return;
        }

        try {
            await staffAPI.delete(staffId);
            toast.success('Staff deleted successfully');

            // Refresh staff list
            const response = await staffAPI.getAll({ search: searchTerm });
            setStaffs(response.data || []);

            // Clear selected staff if deleted
            if (selectedStaff?.id === staffId) {
                setSelectedStaff(response.data[0] || null);
            }
        } catch (error) {
            console.error('Failed to delete staff:', error);
            toast.error(error.message || 'Failed to delete staff');
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-200px)] bg-gray-50 items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!staffs || staffs.length === 0) {
        return (
            <div className="flex h-[calc(100vh-200px)] bg-gray-50 items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No staff found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-200px)] bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                            Staff Directory ({staffs.length})
                        </h2>
                        <button
                            onClick={handleAddStaff}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            title="Add Staff"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-gray-50">
                    {staffs.map((staff) => (
                        <div
                            key={staff.id}
                            onClick={() => handleStaffClick(staff)}
                            className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${selectedStaff?.id === staff.id
                                ? "bg-blue-50 border-l-4 border-blue-500"
                                : "border-l-4 border-transparent"
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                        {staff.profile_photo ? (
                                            <img
                                                src={`${IMAGE_URL}/${staff.profile_photo}`}
                                                alt={staff.first_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm font-bold text-gray-500">
                                                {staff.first_name?.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${staff.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                                        }`}></span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-medium truncate ${selectedStaff?.id === staff.id ? 'text-blue-700' : 'text-gray-900'
                                        }`}>
                                        {staff.first_name} {staff.last_name}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                        {staff.designation || "Staff Member"}
                                    </div>
                                </div>

                                {selectedStaff?.id === staff.id && (
                                    <ChevronRight className="w-4 h-4 text-blue-500" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content - Staff Details */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
                {selectedStaff ? (
                    <div className="relative">
                        {/* Profile Header */}
                        <div className="h-32 bg-gradient-to-r from-gray-600 to-gray-700"></div>

                        <div className="px-8 pb-8">
                            <div className="relative flex items-end -mt-12 mb-6 space-x-5">
                                <div className="w-32 h-32 rounded-xl bg-white p-1 shadow-lg">
                                    <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {selectedStaff.profile_photo ? (
                                            <img
                                                src={`${IMAGE_URL}/${selectedStaff.profile_photo}`}
                                                alt={selectedStaff.first_name}
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
                                                {selectedStaff.first_name} {selectedStaff.last_name}
                                            </h1>
                                            <p className="text-gray-600 flex items-center space-x-2">
                                                <span className="font-medium text-blue-600">
                                                    {selectedStaff.designation || "Staff Member"}
                                                </span>
                                            </p>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleEditStaff(selectedStaff)}
                                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                title="Edit Staff"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStaff(selectedStaff.id)}
                                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                title="Delete Staff"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${selectedStaff.status === 'active'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-gray-100 text-gray-600 border-gray-200'
                                                }`}>
                                                <span className={`w-2 h-2 rounded-full inline-block mr-2 ${selectedStaff.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                                                    }`}></span>
                                                <span className="capitalize">{selectedStaff.status || 'Active'}</span>
                                            </span>
                                        </div>
                                    </div>
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
                                            <p className="text-gray-900 mt-1">{selectedStaff.email || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</p>
                                            <p className="text-gray-900 mt-1">{selectedStaff.phone || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Employment Info */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                                        <Briefcase className="w-5 h-5 mr-2 text-gray-400" />
                                        Employment Details
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Department</p>
                                            <p className="text-gray-900 mt-1">{selectedStaff.department || "General"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Join Date</p>
                                            <p className="text-gray-900 mt-1">
                                                {selectedStaff.joining_date
                                                    ? new Date(selectedStaff.joining_date).toLocaleDateString()
                                                    : "N/A"}
                                            </p>
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
                        <h3 className="text-lg font-semibold text-gray-900">No Staff Selected</h3>
                        <p className="text-gray-500 max-w-sm mt-2">
                            Select a staff member from the list to view their details.
                        </p>
                    </div>
                )}
            </div>

            {/* Modal for Add/Edit Staff */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                disabled={isSubmitting}
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <StaffForm
                                staff={editingStaff}
                                onSubmit={handleFormSubmit}
                                onCancel={handleCloseModal}
                                isSubmitting={isSubmitting}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffList;
