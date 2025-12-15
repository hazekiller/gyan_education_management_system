import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
    Plus,
    Search,
    BookOpen,
    Calendar,
    Clock,
    BookMarked,
    Megaphone
} from "lucide-react";
import { blogAPI, teachersAPI, studentsAPI, timetableAPI } from "../../lib/api";
import { selectUserRole, selectCurrentUser } from "../../store/slices/authSlice";
import { PERMISSIONS, hasPermission } from "../../utils/rbac";
import { toast } from "react-hot-toast";
import Modal from "../../components/common/Modal";
import BlogForm from "../../components/blogs/BlogForm";
import SocialBlogCard from "../../components/blogs/SocialBlogCard";
import { SectionCard, EmptyState } from "../../components/common/EnhancedComponents";

const Blog = () => {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    // Schedule Data
    const [schedule, setSchedule] = useState([]);
    const [loadingSchedule, setLoadingSchedule] = useState(false);

    const role = useSelector(selectUserRole);
    const currentUser = useSelector(selectCurrentUser);
    const canManageBlogs = hasPermission(role, PERMISSIONS.MANAGE_BLOGS);

    useEffect(() => {
        fetchBlogs();
        if (role === 'teacher' || role === 'student') {
            fetchSchedule();
        }
    }, [role]);

    const fetchBlogs = async () => {
        try {
            const response = await blogAPI.getAllBlogs();
            if (response.success) {
                setBlogs(response.data);
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
            const errorMessage = error.response?.status === 404
                ? "Blog service not available"
                : "Failed to fetch blogs";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchSchedule = async () => {
        setLoadingSchedule(true);
        try {
            if (role === 'teacher') {
                const teachersRes = await teachersAPI.getAll();
                const teacherRecord = teachersRes.data?.find(
                    (t) => t.user_id === currentUser.id
                );

                if (teacherRecord) {
                    const scheduleRes = await teachersAPI.getSchedule(teacherRecord.id);
                    setSchedule(scheduleRes.data || []);
                }
            } else if (role === 'student') {
                // Fetch student details to get class_id
                const studentsRes = await studentsAPI.getAll({ user_id: currentUser.id });
                // Assuming the API returns a list and we match the user_id or it returns the single student if filtered
                // Let's iterate to find the student
                const studentRecord = studentsRes.data?.find(s => s.user_id === currentUser.id);

                if (studentRecord) {
                    const days = [
                        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
                    ];
                    const today = days[new Date().getDay()];

                    const scheduleRes = await timetableAPI.get({
                        class_id: studentRecord.class_id,
                        section_id: studentRecord.section_id,
                        day_of_week: today
                    });
                    setSchedule(scheduleRes.data || []);
                }
            }
        } catch (error) {
            console.error("Error fetching schedule:", error);
        } finally {
            setLoadingSchedule(false);
        }
    };

    const getTodaySchedule = () => {
        // Teacher API returns 'day_of_week' (e.g. 'monday'), Timetable API returns it too.
        // We already filtered by day for students in the API call above.
        // But for teachers we fetched ALL.
        if (role === 'teacher') {
            const days = [
                "sunday",
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
            ];
            const today = days[new Date().getDay()];
            return schedule.filter((s) => s.day_of_week?.toLowerCase() === today);
        }
        return schedule; // For students we already fetched today's schedule
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                await blogAPI.deleteBlog(id);
                toast.success("Post deleted successfully");
                setBlogs(blogs.filter(b => b.id !== id));
            } catch (error) {
                console.error("Error deleting blog:", error);
                toast.error("Failed to delete post");
                fetchBlogs();
            }
        }
    };

    const handleCreate = () => {
        setSelectedBlog(null);
        setShowModal(true);
    };

    const handleEdit = (blog) => {
        setSelectedBlog(blog);
        setShowModal(true);
    };

    const handleFormSubmit = async (formData) => {
        setFormLoading(true);
        try {
            if (selectedBlog) {
                await blogAPI.updateBlog(selectedBlog.id, formData);
                toast.success("Post updated successfully");
            } else {
                await blogAPI.createBlog(formData);
                toast.success("Post created successfully");
            }
            setShowModal(false);
            fetchBlogs();
        } catch (error) {
            console.error("Error saving blog:", error);
            toast.error(error.response?.data?.message || "Failed to save post");
        } finally {
            setFormLoading(false);
        }
    };

    const filteredBlogs = blogs.filter((blog) =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const todaySchedule = getTodaySchedule();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Feed Column */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Header Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-shadow hover:shadow-md">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-600 p-2 rounded-lg">
                                        <BookOpen className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold text-gray-900 leading-none">School Feed</h1>
                                        <p className="text-xs text-gray-500 mt-1">Community updates & news</p>
                                    </div>
                                </div>

                                {canManageBlogs && (
                                    <button
                                        onClick={handleCreate}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span className="hidden sm:inline">Create Post</span>
                                    </button>
                                )}
                            </div>

                            <div className="mt-4 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search posts..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Top Center Schedule Widget */}
                        {(role === 'teacher' || role === 'student') && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                        Today's Schedule
                                    </h3>
                                    <Link to="/schedule" className="text-xs text-blue-600 hover:underline font-medium">View Full</Link>
                                </div>

                                {loadingSchedule ? (
                                    <div className="flex justify-center py-4">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : todaySchedule.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {todaySchedule.slice(0, 3).map((period) => (
                                            <div
                                                key={period.id}
                                                className="p-3 rounded-lg border-l-4 border bg-blue-50 border-blue-500 border-gray-100"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-sm truncate">
                                                            {period.subject_name || "Subject"}
                                                        </h4>
                                                        <p className="text-xs text-gray-600 mb-1">
                                                            {period.class_name} {period.section_name && `- ${period.section_name}`}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {period.start_time}
                                                            </span>
                                                            {period.room_number && (
                                                                <span className="flex items-center gap-1">
                                                                    <BookMarked className="w-3 h-3" />
                                                                    {period.room_number}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {todaySchedule.length > 3 && (
                                            <div className="flex items-center justify-center p-3 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 text-xs font-medium cursor-pointer hover:bg-gray-100" onClick={() => navigate('/schedule')}>
                                                +{todaySchedule.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-500">No classes scheduled for today.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Feed Content */}
                        {filteredBlogs.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">No posts found</h3>
                                <p className="text-gray-500 text-sm mt-1">
                                    {searchTerm
                                        ? `No matches for "${searchTerm}"`
                                        : "Check back later for updates from the school community."}
                                </p>
                            </div>
                        ) : (
                            filteredBlogs.map((blog) => (
                                <SocialBlogCard
                                    key={blog.id}
                                    blog={blog}
                                    currentUser={currentUser}
                                    onDelete={handleDelete}
                                    onEdit={handleEdit}
                                />
                            ))
                        )}
                    </div>

                    {/* Right Sidebar Column */}
                    <div className="hidden lg:block lg:col-span-1 space-y-6">
                        {/* Recent Notices Widget */}
                        <SectionCard
                            title="Notices"
                            icon={Megaphone}
                            className="bg-white shadow-sm border border-gray-200"
                        >
                            <div className="space-y-3">
                                <div className="p-3 bg-white border border-gray-100 border-l-4 border-l-red-500 rounded-lg shadow-sm">
                                    <p className="text-xs font-bold text-red-600 mb-1">Fee Deadline</p>
                                    <p className="text-xs text-gray-600">Please clear pending dues by Friday.</p>
                                </div>
                                <div className="p-3 bg-white border border-gray-100 border-l-4 border-l-blue-500 rounded-lg shadow-sm">
                                    <p className="text-xs font-bold text-blue-600 mb-1">Exam Schedule</p>
                                    <p className="text-xs text-gray-600">Mid-term dates released. Check dashboard.</p>
                                </div>
                            </div>
                        </SectionCard>

                        {/* School Info Widget */}
                        <div className="text-center text-xs text-gray-400 mt-4">
                            <p className="font-medium">© 2025 Gyan School</p>
                            <p>School Management System</p>
                            <div className="flex justify-center gap-3 mt-2">
                                <span className="hover:text-blue-500 cursor-pointer">Privacy</span>
                                <span>•</span>
                                <span className="hover:text-blue-500 cursor-pointer">Terms</span>
                                <span>•</span>
                                <span className="hover:text-blue-500 cursor-pointer">Help</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={selectedBlog ? "Edit Post" : "Create Post"}
                    size="lg"
                >
                    <BlogForm
                        blog={selectedBlog}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setShowModal(false)}
                        loading={formLoading}
                    />
                </Modal>
            </div>
        </div>
    );
};

export default Blog;
