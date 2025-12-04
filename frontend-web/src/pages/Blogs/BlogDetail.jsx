import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Edit } from "lucide-react";
import { blogAPI } from "../../lib/api";
import { useSelector } from "react-redux";
import { selectUserRole } from "../../store/slices/authSlice";
import { PERMISSIONS, hasPermission } from "../../utils/rbac";
import { formatDate } from "../../utils/dateUtils";
import { toast } from "react-hot-toast";

const BlogDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const role = useSelector(selectUserRole);
    const canManageBlogs = hasPermission(role, PERMISSIONS.MANAGE_BLOGS);

    useEffect(() => {
        fetchBlog();
    }, [id]);

    const fetchBlog = async () => {
        try {
            const response = await blogAPI.getBlogById(id);
            if (response.success) {
                setBlog(response.data);
            }
        } catch (error) {
            console.error("Error fetching blog:", error);
            toast.error("Failed to fetch blog");
            navigate("/blogs");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!blog) return null;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <button
                onClick={() => navigate("/blogs")}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Blogs
            </button>

            <article className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-8">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                        <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                            {blog.status}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(blog.created_at)}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                        {blog.title}
                    </h1>

                    <div className="flex items-center justify-between py-6 border-y border-gray-100 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">
                                    {blog.first_name} {blog.last_name}
                                </p>
                                <p className="text-xs text-gray-500">Author</p>
                            </div>
                        </div>

                        {canManageBlogs && (
                            <Link
                                to={`/blogs/edit/${blog.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Blog
                            </Link>
                        )}
                    </div>

                    <div className="prose prose-blue max-w-none">
                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                            {blog.content}
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
};

export default BlogDetail;
