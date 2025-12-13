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
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
                            <BookOpen className="w-10 h-10 text-blue-700" />
                            School Blog
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg font-light">
                            Insights, news, and updates from our community
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search articles..."
                                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm text-gray-900 placeholder-gray-400 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {canManageBlogs && (
                            <button
                                onClick={handleCreate}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all font-medium shadow-sm hover:shadow-md active:transform active:scale-95"
                            >
                                <Plus className="w-5 h-5" />
                                New Post
                            </button>
                        )}
                    </div>
                </div>

                {filteredBlogs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No blogs found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            {searchTerm
                                ? `We couldn't find any articles matching "${searchTerm}"`
                                : "There are no blog posts available at the moment."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredBlogs.map((blog) => (
                            <article
                                key={blog.id}
                                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100 hover:border-blue-100"
                            >
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between gap-2 mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${blog.status === 'published'
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {blog.status}
                                        </span>
                                        <div className="flex items-center gap-1 text-xs font-medium text-gray-400">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatDate(blog.created_at)}
                                        </div>
                                    </div>

                                    <Link to={`/blogs/${blog.id}`} className="block group-hover:text-blue-700 transition-colors">
                                        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-snug">
                                            {blog.title}
                                        </h2>
                                    </Link>

                                    <p className="text-gray-600 mb-6 line-clamp-3 text-sm leading-relaxed flex-grow">
                                        {blog.content.replace(/<[^>]*>/g, "").substring(0, 150)}...
                                    </p>

                                    <div className="flex items-center justify-between pt-5 border-t border-gray-100 mt-auto">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                                <User className="w-4 h-4 text-gray-600" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-900">
                                                    {blog.first_name} {blog.last_name}
                                                </span>
                                                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Author</span>
                                            </div>
                                        </div>

                                        {canManageBlogs && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(blog)}
                                                    className="p-2 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(blog.id)}
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                    title={selectedBlog ? "Edit Article" : "Create New Article"}
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
