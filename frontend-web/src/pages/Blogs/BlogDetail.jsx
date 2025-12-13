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
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate("/blogs")}
                    className="group flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium"
                >
                    <div className="p-2 rounded-full bg-white border border-gray-200 group-hover:border-gray-300 mr-3 shadow-sm transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Back to Articles
                </button>

                <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 md:p-12">
                        <div className="flex flex-wrap items-center gap-4 text-sm mb-8">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${blog.status === 'published'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                {blog.status}
                            </span>
                            <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                            <span className="flex items-center gap-2 text-gray-500 font-medium">
                                <Calendar className="w-4 h-4" />
                                {formatDate(blog.created_at)}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight">
                            {blog.title}
                        </h1>

                        <div className="flex items-center justify-between py-8 border-y border-gray-100 mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                    <User className="w-6 h-6 text-gray-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-lg">
                                        {blog.first_name} {blog.last_name}
                                    </p>
                                    <p className="text-sm text-gray-500 font-medium">Author</p>
                                </div>
                            </div>

                            {canManageBlogs && (
                                <Link
                                    to={`/blogs/edit/${blog.id}`}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all font-medium border border-gray-200 hover:border-blue-200"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit Article
                                </Link>
                            )}
                        </div>

                        <div className="prose prose-lg prose-blue max-w-none">
                            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-light">
                                {blog.content}
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
};

export default BlogDetail;
