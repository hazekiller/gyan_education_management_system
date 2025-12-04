import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    Edit,
    Trash2,
    Plus,
    Calendar,
    User,
    Search,
    BookOpen,
} from "lucide-react";
import { blogAPI } from "../../lib/api";
import { selectUserRole } from "../../store/slices/authSlice";
import { PERMISSIONS, hasPermission } from "../../utils/rbac";
import { formatDate } from "../../utils/dateUtils";
import { toast } from "react-hot-toast";
import Modal from "../../components/common/Modal";
import BlogForm from "../../components/blogs/BlogForm";

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    const role = useSelector(selectUserRole);
    const canManageBlogs = hasPermission(role, PERMISSIONS.MANAGE_BLOGS);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const response = await blogAPI.getAllBlogs();
            if (response.success) {
                setBlogs(response.data);
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
            toast.error("Failed to fetch blogs");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this blog?")) {
            try {
                await blogAPI.deleteBlog(id);
                toast.success("Blog deleted successfully");
                fetchBlogs();
            } catch (error) {
                console.error("Error deleting blog:", error);
                toast.error("Failed to delete blog");
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
                toast.success("Blog updated successfully");
            } else {
                await blogAPI.createBlog(formData);
                toast.success("Blog created successfully");
            }
            setShowModal(false);
            fetchBlogs();
        } catch (error) {
            console.error("Error saving blog:", error);
            toast.error(error.response?.data?.message || "Failed to save blog");
        } finally {
            setFormLoading(false);
        }
    };

    const filteredBlogs = blogs.filter((blog) =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <BookOpen className="w-8 h-8 text-blue-600" />
                        School Blog
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Latest updates, news, and articles from the school
                    </p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search blogs..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {canManageBlogs && (
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Create Blog
                        </button>
                    )}
                </div>
            </div>

            {filteredBlogs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900">No blogs found</h3>
                    <p className="text-gray-500 mt-2">
                        {searchTerm
                            ? "Try adjusting your search terms"
                            : "Check back later for new updates"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBlogs.map((blog) => (
                        <article
                            key={blog.id}
                            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full"
                        >
                            <div className="p-6 flex-1">
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                    <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                                        {blog.status}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(blog.created_at)}
                                    </span>
                                </div>

                                <Link to={`/blogs/${blog.id}`}>
                                    <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors line-clamp-2">
                                        {blog.title}
                                    </h2>
                                </Link>

                                <p className="text-gray-600 mb-4 line-clamp-3">
                                    {blog.content.replace(/<[^>]*>/g, "").substring(0, 150)}...
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            <User className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <span>
                                            {blog.first_name} {blog.last_name}
                                        </span>
                                    </div>

                                    {canManageBlogs && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(blog)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(blog.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selectedBlog ? "Edit Blog" : "Create New Blog"}
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
    );
};

export default Blog;
