import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
    Heart,
    MessageSquare,
    Share2,
    MoreHorizontal,
    Send,
    User,
    Trash2
} from "lucide-react";
import { blogAPI } from "../../lib/api";
import { toast } from "react-hot-toast";

const SocialBlogCard = ({ blog, currentUser, onDelete, onEdit }) => {
    const [isLiked, setIsLiked] = useState(false); // Default to false, will sync with effect
    const [likeCount, setLikeCount] = useState(0);
    const [commentCount, setCommentCount] = useState(0);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentsLoaded, setCommentsLoaded] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    // Initialize state from props
    useEffect(() => {
        setIsLiked(Boolean(blog.is_liked));
        setLikeCount(Number(blog.like_count || 0));
        setCommentCount(Number(blog.comment_count || 0));
    }, [blog]);

    const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5002/api").replace('/api', '');

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const handleLike = async () => {
        if (!currentUser) {
            toast.error("Please login to like this post");
            return;
        }

        // Optimistic update
        const previousLiked = isLiked;
        const previousCount = likeCount;

        setIsLiked(!isLiked);
        setLikeCount(prev => !isLiked ? prev + 1 : prev - 1);

        try {
            const response = await blogAPI.toggleLike(blog.id);
            if (response.success) {
                // Sync with server response to be sure
                setIsLiked(response.isLiked);
                setLikeCount(response.count);
            }
        } catch (error) {
            console.error("Error liking blog:", error);
            // Revert on error
            setIsLiked(previousLiked);
            setLikeCount(previousCount);
            toast.error("Failed to update like");
        }
    };

    const handleToggleComments = async () => {
        const newShowComments = !showComments;
        setShowComments(newShowComments);

        if (newShowComments && !commentsLoaded) {
            fetchComments();
        }
    };

    const fetchComments = async () => {
        setLoadingComments(true);
        try {
            const response = await blogAPI.getComments(blog.id);
            if (response.success) {
                setComments(response.data);
                setCommentsLoaded(true);
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
            toast.error("Failed to load comments");
        } finally {
            setLoadingComments(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            toast.error("Please login to comment");
            return;
        }
        if (!newComment.trim()) return;

        setSubmittingComment(true);
        try {
            const response = await blogAPI.addComment(blog.id, newComment);
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
        if (!window.confirm("Delete this comment?")) return;

        try {
            await blogAPI.deleteComment(blog.id, commentId);
            setComments(comments.filter(c => c.id !== commentId));
            setCommentCount(prev => prev - 1);
            toast.success("Comment deleted");
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast.error("Failed to delete comment");
        }
    };

    const formatTime = (dateString) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch (e) {
            return "recently";
        }
    };

    // Check if user is admin or author
    const canManage = currentUser && (
        ['admin', 'super_admin'].includes(currentUser.role) ||
        blog.author_id === currentUser.id
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-visible">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 text-blue-700">
                        {blog.image_url && false ? (
                            // Placeholder for user avatar if we had one
                            <img src="" alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <User className="w-6 h-6" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                            {blog.first_name} {blog.last_name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{formatTime(blog.created_at)}</span>
                            <span>•</span>
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded capitalize">{blog.role}</span>
                        </div>
                    </div>
                </div>

                {canManage && (
                    <div className="relative">
                        <button
                            onClick={() => setShowOptions(!showOptions)}
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                        >
                            <MoreHorizontal className="w-5 h-5" />
                        </button>

                        {showOptions && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                                <button
                                    onClick={() => { setShowOptions(false); onEdit(blog); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <span>Edit Post</span>
                                </button>
                                <button
                                    onClick={() => { setShowOptions(false); onDelete(blog.id); }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete Post</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Content Body */}
            <div className="px-4 pb-2">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{blog.title}</h2>
                <div className="text-gray-800 text-sm md:text-base whitespace-pre-wrap mb-4 line-clamp-4">
                    {blog.content}
                </div>
            </div>

            {/* Post Image */}
            {blog.image_url && (
                <div className="w-full bg-gray-100">
                    <img
                        src={getImageUrl(blog.image_url)}
                        alt={blog.title}
                        className="w-full h-auto max-h-[600px] object-cover"
                    />
                </div>
            )}

            {/* Stats Bar */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    {likeCount > 0 && (
                        <div className="flex items-center gap-1">
                            <div className="bg-blue-500 p-1 rounded-full">
                                <Heart className="w-3 h-3 text-white fill-current" />
                            </div>
                            <span>{likeCount}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={handleToggleComments} className="hover:underline">
                        {commentCount} comments
                    </button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-2 py-1 flex items-center justify-between">
                <button
                    onClick={handleLike}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${isLiked
                            ? "text-blue-600 bg-blue-50"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                    Like
                </button>

                <button
                    onClick={handleToggleComments}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <MessageSquare className="w-5 h-5" />
                    Comment
                </button>

                {/* Placeholder for Share - can be implemented later */}
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                    <Share2 className="w-5 h-5" />
                    Share
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                    {/* Comment Input */}
                    {currentUser && (
                        <form onSubmit={handleSubmitComment} className="flex gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {currentUser.first_name?.[0]}
                            </div>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="w-full px-4 py-2 bg-gray-100 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={submittingComment || !newComment.trim()}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-blue-600 hover:bg-blue-50 rounded-full disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Comments List */}
                    {loadingComments ? (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {comments.length === 0 ? (
                                <p className="text-center text-gray-500 text-sm py-2">No comments yet.</p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold flex-shrink-0">
                                            {comment.first_name?.[0]}
                                        </div>
                                        <div className="flex-1 group">
                                            <div className="bg-gray-100 rounded-2xl px-4 py-2 inline-block min-w-[150px]">
                                                <div className="font-semibold text-xs text-gray-900">
                                                    {comment.first_name} {comment.last_name}
                                                </div>
                                                <p className="text-sm text-gray-800 break-words">{comment.content}</p>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 ml-2 text-xs text-gray-500">
                                                <span>{formatTime(comment.created_at)}</span>
                                                {currentUser && (currentUser.id === comment.user_id || ['admin', 'super_admin'].includes(currentUser.role)) && (
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="font-medium hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SocialBlogCard;
