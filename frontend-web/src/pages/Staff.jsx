import { useState } from "react";
import { Plus } from "lucide-react";
import StaffList from "../components/staff/StaffList";
import { staffAPI } from "../lib/api";
import { PERMISSIONS } from "../utils/rbac";
import PermissionGuard from "../components/common/PermissionGuard";
import StaffForm from "../components/staff/StaffForm";
import Modal from "../components/common/Modal";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const Staff = () => {
    const queryClient = useQueryClient();
    const [showAddStaffModal, setShowAddStaffModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const handleAddStaff = async (formData) => {
        try {
            await staffAPI.create(formData);
            toast.success("Staff added successfully!");
            setShowAddStaffModal(false);
            queryClient.invalidateQueries({ queryKey: ["staff"] });
        } catch (error) {
            toast.error(error.message || "Failed to add staff");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Title and Add Button */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
                    <p className="text-gray-500 text-sm">Manage all support staff members</p>
                </div>

                <PermissionGuard permission={PERMISSIONS.CREATE_TEACHERS}> {/* Reusing teacher permission for now as per UserPage, or should typically be MANAGE_STAFF if available */}
                    <button
                        onClick={() => setShowAddStaffModal(true)}
                        className="btn btn-primary flex items-center space-x-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Staff</span>
                    </button>
                </PermissionGuard>
            </div>

            {/* Content Area */}
            <div>
                <StaffList searchTerm={searchTerm} />
            </div>

            {/* Modals */}
            <Modal
                isOpen={showAddStaffModal}
                onClose={() => setShowAddStaffModal(false)}
                title="Add New Staff"
                size="lg"
            >
                <StaffForm
                    onSubmit={handleAddStaff}
                    onCancel={() => setShowAddStaffModal(false)}
                />
            </Modal>

        </div>
    );
};

export default Staff;
