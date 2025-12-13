import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";

const BlogForm = ({ blog, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        status: "published",
    });

    useEffect(() => {
        if (blog) {
            setFormData({
                title: blog.title || "",
                content: blog.content || "",
                status: blog.status || "published",
            });
        }
    }, [blog]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label
                    htmlFor="title"
                    className="block text-sm font-semibold text-gray-700 mb-1"
                >
                    Title
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all font-medium"
                    placeholder="Enter blog title"
                />
            </div>

            <div>
                <label
                    htmlFor="status"
                    className="block text-sm font-semibold text-gray-700 mb-1"
                >
                    Status
                </label>
                <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 font-medium bg-white"
                >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                </select>
            </div>

            <div>
                <label
                    htmlFor="content"
                    className="block text-sm font-semibold text-gray-700 mb-1"
                >
                    Content
                </label>
                <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent font-mono text-sm text-gray-800 leading-relaxed"
                    placeholder="Write your blog content here..."
                />
                <p className="text-xs text-gray-500 mt-2 font-medium">
                    Supports basic text. (Rich text editor can be added later)
                </p>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 mt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-6 py-2.5 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all font-medium shadow-sm hover:shadow active:transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <Save className="w-5 h-5 mr-2" />
                    {loading ? "Saving..." : blog ? "Update Article" : "Publish Article"}
                </button>
            </div>
        </form>
    );
};

export default BlogForm;
