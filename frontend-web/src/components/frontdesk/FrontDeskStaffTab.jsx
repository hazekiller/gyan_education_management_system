import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Plus, Edit, Trash2, Search, User } from "lucide-react";
import { staffAPI } from "../../lib/api";
import toast from "react-hot-toast";
import StaffForm from "../staff/StaffForm";
import Modal from "../common/Modal";
import { selectCurrentUser, selectUserRole } from "../../store/slices/authSlice";

const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "http://localhost:5001";

const FrontDeskStaffTab = () => {
    const currentUser = useSelector(selectCurrentUser);
    const userRole = useSelector(selectUserRole);
    const [staff, setStaff] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check if user is admin (can add/delete staff)
    const isAdmin = ['super_admin', 'principal', 'vice_principal', 'admin'].includes(userRole);

    useEffect(() => {
        fetchStaff();
    }, [searchTerm]);

    const fetchStaff = async () => {
        setIsLoading(true);
        try {
            // Filter explicitly for Frontdesk designation only
            const response = await staffAPI.getAll({
                designation: 'Frontdesk',
                search: searchTerm,
                status: 'active' // Optional: show only active staff
            });

            // Additional client-side filtering to ensure only Frontdesk staff
            const frontdeskStaff = (response.data || []).filter(
                (staffMember) => staffMember.designation === 'Frontdesk'
            );

            setStaff(frontdeskStaff);

            if (frontdeskStaff.length === 0 && !searchTerm) {
                console.log("No Frontdesk staff found");
            }
        } catch (error) {
            console.error("Failed to fetch frontdesk staff:", error);
            toast.error("Failed to load frontdesk staff");
            setStaff([]); // Clear staff on error
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddStaff = () => {
        setEditingStaff(null);
        setShowAddModal(true);
    };

    const handleEditStaff = (staffMember) => {
        // Verify the staff member is actually a Frontdesk staff
        if (staffMember.designation !== 'Frontdesk') {
            toast.error("Can only edit Frontdesk staff members");
            return;
        }
        setEditingStaff(staffMember);
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingStaff(null);
    };

    const handleFormSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            // Ensure designation is set to Frontdesk
            const frontdeskData = {
                ...formData,
                designation: 'Frontdesk',
                department: formData.department || 'Front Desk'
            };

            if (editingStaff) {
                await staffAPI.update(editingStaff.id, frontdeskData);
                toast.success("Front desk staff updated successfully");
            } else {
                await staffAPI.create(frontdeskData);
                toast.success("Front desk staff added successfully");
            }
            fetchStaff();
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save frontdesk staff:", error);
            toast.error(error.message || "Failed to save frontdesk staff");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteStaff = async (id) => {
        if (!window.confirm("Are you sure you want to delete this front desk staff member?")) {
            return;
        }

        try {
            await staffAPI.delete(id);
            toast.success("Front desk staff deleted successfully");
            fetchStaff();
        } catch (error) {
            console.error("Failed to delete frontdesk staff:", error);
            toast.error(error.message || "Failed to delete frontdesk staff");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Search and Add Button */}
            <div className="flex justify-between items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name or employee ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-10 w-full"
                    />
                </div>
                {isAdmin && (
                    <button
                        onClick={handleAddStaff}
                        className="btn btn-primary flex items-center space-x-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Front Desk Staff</span>
                    </button>
                )}
            </div>

            {/* Staff Grid */}
            {staff.length === 0 ? (
                <div className="flex h-64 items-center justify-center bg-gray-50 rounded-xl">
                    <div className="text-center">
                        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No front desk staff found</p>
                        {isAdmin && (
                            <button
                                onClick={handleAddStaff}
                                className="mt-4 btn btn-primary"
                            >
                                Add First Staff Member
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {staff.map((staffMember) => (
                        <div
                            key={staffMember.id}
                            className="card hover:shadow-lg transition-shadow duration-200"
                        >
                            <div className="flex items-start space-x-4">
                                {/* Profile Photo */}
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {staffMember.profile_photo ? (
                                        <img
                                            src={`${IMAGE_URL}/${staffMember.profile_photo}`}
                                            alt={staffMember.first_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold text-gray-500">
                                            {staffMember.first_name?.charAt(0)}
                                        </span>
                                    )}
                                </div>

                                {/* Staff Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                                        {staffMember.first_name} {staffMember.last_name}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        ID: {staffMember.employee_id}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {staffMember.phone}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {staffMember.email}
                                    </p>
                                    <div className="mt-2">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${staffMember.status === "active"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {staffMember.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-4 flex space-x-2">
                                <button
                                    onClick={() => handleEditStaff(staffMember)}
                                    className="flex-1 btn btn-secondary flex items-center justify-center space-x-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Edit</span>
                                </button>
                                {isAdmin && (
                                    <button
                                        onClick={() => handleDeleteStaff(staffMember.id)}
                                        className="flex-1 btn bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center space-x-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Delete</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={handleCloseModal}
                title={editingStaff ? "Edit Front Desk Staff" : "Add Front Desk Staff"}
                size="lg"
            >
                <StaffForm
                    staff={editingStaff}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCloseModal}
                    isSubmitting={isSubmitting}
                />
            </Modal>
        </div>
    );
};

export default FrontDeskStaffTab;