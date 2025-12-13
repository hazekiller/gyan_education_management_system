import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, Plus } from "lucide-react";
import StudentTable from "../components/students/StudentTable";
import TeacherTable from "../components/teachers/TeacherTable";
import StaffList from "../components/staff/StaffList";
import { studentsAPI, teachersAPI, staffAPI, classesAPI } from "../lib/api";
import { PERMISSIONS } from "../utils/rbac";
import PermissionGuard from "../components/common/PermissionGuard";
import StudentForm from "../components/common/StudentForm";
import TeacherForm from "../components/common/TeacherForm";
import StaffForm from "../components/staff/StaffForm";
import Modal from "../components/common/Modal";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const UserPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "students");
    const [filters, setFilters] = useState({
        class_id: "",
        section_id: "",
        status: "active",
        search: "",
    });

    // Sync activeTab with URL search params
    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const queryClient = useQueryClient();
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
    const [showAddStaffModal, setShowAddStaffModal] = useState(false);

    // Fetch students (only if active tab is students)
    const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
        queryKey: ["students", filters],
        queryFn: () => studentsAPI.getAll(filters),
        enabled: activeTab === "students",
    });

    // Fetch classes for dropdown
    const { data: classesData } = useQuery({
        queryKey: ["classes"],
        queryFn: classesAPI.getAll,
    });

    // Fetch teachers (only if active tab is teachers)
    const { data: teachersData, isLoading: isLoadingTeachers } = useQuery({
        queryKey: ["teachers", filters.search],
        queryFn: () => teachersAPI.getAll({ search: filters.search }),
        enabled: activeTab === "teachers",
    });

    const handleAddStudent = async (formData) => {
        try {
            await studentsAPI.create(formData);
            toast.success("Student added successfully!");
            setShowAddStudentModal(false);
            queryClient.invalidateQueries({ queryKey: ["students"] });
        } catch (error) {
            toast.error(error.message || "Failed to add student");
        }
    };

    const handleAddTeacher = async (formData) => {
        try {
            await teachersAPI.create(formData);
            toast.success("Teacher added successfully!");
            setShowAddTeacherModal(false);
            queryClient.invalidateQueries({ queryKey: ["teachers"] });
        } catch (error) {
            toast.error(error.message || "Failed to add teacher");
        }
    };

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

    const tabs = [
        { id: "students", label: "Students" },
        { id: "teachers", label: "Teachers" },
        { id: "staffs", label: "Staffs" },
    ];

    return (
        <div className="space-y-6">
            {/* Header with Title and Add Button */}
            <div className="flex justify-between items-center">
                <div>
                    {/* Empty div for spacing if no title needed, or add title if desired */}
                </div>

                {activeTab === "students" && (
                    <PermissionGuard permission={PERMISSIONS.CREATE_STUDENTS}>
                        <button
                            onClick={() => setShowAddStudentModal(true)}
                            className="btn btn-primary flex items-center space-x-2"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Student</span>
                        </button>
                    </PermissionGuard>
                )}

                {activeTab === "teachers" && (
                    <PermissionGuard permission={PERMISSIONS.CREATE_TEACHERS}>
                        <button
                            onClick={() => setShowAddTeacherModal(true)}
                            className="btn btn-primary flex items-center space-x-2"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Teacher</span>
                        </button>
                    </PermissionGuard>
                )}

                {activeTab === "staffs" && (
                    <PermissionGuard permission={PERMISSIONS.CREATE_TEACHERS}>
                        <button
                            onClick={() => setShowAddStaffModal(true)}
                            className="btn btn-primary flex items-center space-x-2"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Staff</span>
                        </button>
                    </PermissionGuard>
                )}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                const newTab = tab.id;
                                setActiveTab(newTab);
                                setSearchParams({ tab: newTab });
                                // Reset filters on tab switch if needed
                                if (newTab !== activeTab) {
                                    setFilters(prev => ({ ...prev, class_id: "", section_id: "" }));
                                }
                            }}
                            className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                ${activeTab === tab.id
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }
              `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Filter Row */}
            <div className="card"> {/* Using card class for shadow/bg like in screenshot */}
                <div className="flex flex-col md:flex-row gap-4 items-center">

                    {/* Conditional Filters: Class & Section only for Students (or maybe others if applicable) */}
                    {activeTab === "students" && (
                        <>
                            {/* Program Filter (Placeholder as 'All Program') - assuming API doesn't support it or it's static for now */}
                            <select className="input md:w-48">
                                <option value="">All Program</option>
                                <option value="science">Science</option>
                                <option value="management">Management</option>
                                <option value="humanities">Humanities</option>
                            </select>

                            <select
                                value={filters.class_id}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        class_id: e.target.value,
                                        section_id: "",
                                    })
                                }
                                className="input md:w-48"
                            >
                                <option value="">All class</option>
                                {classesData?.data?.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={filters.section_id}
                                onChange={(e) => setFilters({ ...filters, section_id: e.target.value })}
                                className="input md:w-48"
                            >
                                <option value="">All section</option>
                                {/* Ideally populate sections based on selected class */}
                            </select>
                        </>
                    )}

                    {/* Search box - Always visible or per tab */}
                    <div className={`relative flex-1 ${activeTab !== 'students' ? 'w-full' : ''}`}>
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search"
                            value={filters.search}
                            onChange={(e) =>
                                setFilters({ ...filters, search: e.target.value })
                            }
                            className="input pl-10 w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div>
                {activeTab === "students" && (
                    <StudentTable students={studentsData?.data || []} isLoading={isLoadingStudents} />
                )}
                {activeTab === "teachers" && (
                    <TeacherTable
                        teachers={teachersData?.data || []}
                        isLoading={isLoadingTeachers}
                        onUpdate={() => queryClient.invalidateQueries(["teachers"])}
                    />
                )}
                {activeTab === "staffs" && (
                    <StaffList searchTerm={filters.search} />
                )}
            </div>

            {/* Modals */}
            <Modal
                isOpen={showAddStudentModal}
                onClose={() => setShowAddStudentModal(false)}
                title="Add New Student"
                size="md"
            >
                <StudentForm
                    onSubmit={handleAddStudent}
                    onCancel={() => setShowAddStudentModal(false)}
                />
            </Modal>

            <Modal
                isOpen={showAddTeacherModal}
                onClose={() => setShowAddTeacherModal(false)}
                title="Add New Teacher"
                size="lg"
            >
                <TeacherForm
                    onSubmit={handleAddTeacher}
                    onCancel={() => setShowAddTeacherModal(false)}
                />
            </Modal>

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

export default UserPage;
