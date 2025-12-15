import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Edit, Heart, MessageSquare, Send, Trash2 } from "lucide-react";
import { blogAPI } from "../../lib/api";
import { useSelector } from "react-redux";
import { selectUserRole, selectCurrentUser } from "../../store/slices/authSlice";
import { PERMISSIONS, hasPermission } from "../../utils/rbac";
import { formatDate } from "../../utils/dateUtils";
import { toast } from "react-hot-toast";

const BlogDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [commentCount, setCommentCount] = useState(0);
    const [submittingComment, setSubmittingComment] = useState(false);

    const role = useSelector(selectUserRole);
    const user = useSelector(selectCurrentUser);
    const canManageBlogs = hasPermission(role, PERMISSIONS.MANAGE_BLOGS);

    useEffect(() => {
        fetchBlog();
        fetchComments();
        if (user) {
            fetchLikeStatus();
        }
    }, [id, user]);

    const fetchBlog = async () => {
        try {
            const response = await blogAPI.getBlogById(id);
            if (response.success) {
                setBlog(response.data);
                setLikeCount(Number(response.data.like_count || 0));
            }
        } catch (error) {
            console.error("Error fetching blog:", error);
            toast.error("Failed to fetch blog");
            navigate("/blogs");
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await blogAPI.getComments(id);
            if (response.success) {
                setComments(response.data);
                setCommentCount(response.data.length);
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    const fetchLikeStatus = async () => {
        try {
            const response = await blogAPI.getLikeStatus(id);
            if (response.success) {
                setIsLiked(response.isLiked);
            }
        } catch (error) {
            console.error("Error fetching like status:", error);
        }
    };

    const handleLike = async () => {
        if (!user) {
            toast.error("Please login to like this article");
            return;
        }

        try {
            // Optimistic update
            const newIsLiked = !isLiked;
            setIsLiked(newIsLiked);
            setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

            const response = await blogAPI.toggleLike(id);
            if (response.success) {
                // Confirm with server state
                setIsLiked(response.isLiked);
                setLikeCount(response.count);
            }
        } catch (error) {
            console.error("Error toggling like:", error);
            // Revert on error
            setIsLiked(!isLiked);
            setLikeCount(prev => !isLiked ? prev + 1 : prev - 1);
            toast.error("Failed to like article");
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please login to comment");
            return;
        }
        if (!newComment.trim()) return;

        setSubmittingComment(true);
        try {
            const response = await blogAPI.addComment(id, newComment);
            if (response.success) {
                setComments([response.data, ...comments]);
                setCommentCount(prev => prev + 1);
                setNewComment("");
                toast.success("Comment posted");
            }
        } catch (error) {
            console.error("Error posting comment:", error);
            toast.error("Failed to post comment");
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            await blogAPI.deleteComment(id, commentId);
            setComments(comments.filter(c => c.id !== commentId));
            setCommentCount(prev => prev - 1);
            toast.success("Comment deleted");
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast.error("Failed to delete comment");
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

                        {blog.image_url && (
                            <div className="mb-10 w-full rounded-xl overflow-hidden shadow-sm">
                                <img
                                    src={`${(import.meta.env.VITE_API_URL || "http://localhost:5002/api").replace('/api', '')}${blog.image_url.startsWith('/') ? '' : '/'}${blog.image_url}`}
                                    alt={blog.title}
                                    className="w-full h-auto object-cover max-h-[500px]"
                                />
                            </div>
                        )}

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

                        {/* Like Section inside content */}
                        <div className="flex items-center gap-4 mb-8">
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${isLiked
                                    ? 'bg-red-50 border-red-200 text-red-600'
                                    : 'bg-white border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500'
                                    }`}
                            >
                                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                <span className="font-medium">{likeCount} Likes</span>
                            </button>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-500 bg-white">
                                <MessageSquare className="w-5 h-5" />
                                <span className="font-medium">{commentCount} Comments</span>
                            </div>
                        </div>

                        <div className="prose prose-lg prose-blue max-w-none">
                            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-light">
                                {blog.content}
                            </div>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="border-t border-gray-100 bg-gray-50 p-8 md:p-12">
                        <h3 className="text-2xl font-bold text-gray-900 mb-8">Comments ({comments.length})</h3>

                        {/* Comment Form */}
                        {user && (
                            <form onSubmit={handleCommentSubmit} className="mb-10">
                                <div className="relative">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Share your thoughts..."
                                        className="w-full p-4 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent min-h-[100px] resize-y"
                                    ></textarea>
                                    <button
                                        type="submit"
                                        disabled={submittingComment || !newComment.trim()}
                                        className="absolute bottom-4 right-4 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Comments List */}
                        <div className="space-y-6">
                            {comments.length === 0 ? (
                                <p className="text-gray-500 italic">No comments yet. Be the first to share your thoughts!</p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold">
                                                    {comment.first_name[0]}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-gray-900">
                                                            {comment.first_name} {comment.last_name}
                                                        </span>
                                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                                                            {comment.author_role}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-400 block mt-0.5">
                                                        {formatDate(comment.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                            {(user && (user.id === comment.user_id || ['admin', 'super_admin'].includes(role))) && (
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                    title="Delete comment"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="mt-4 text-gray-700 whitespace-pre-wrap">
                                            {comment.content}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
};

export default BlogDetail;
