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
                    className="block text-sm font-medium text-gray-700 mb-1"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter blog title"
                />
            </div>

            <div>
                <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Status
                </label>
                <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                </select>
            </div>

            <div>
                <label
                    htmlFor="content"
                    className="block text-sm font-medium text-gray-700 mb-1"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="Write your blog content here..."
                />
                <p className="text-xs text-gray-500 mt-1">
                    Supports basic text. (Rich text editor can be added later)
                </p>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-5 h-5 mr-2" />
                    {loading ? "Saving..." : blog ? "Update Blog" : "Publish Blog"}
                </button>
            </div>
        </form>
    );
};

export default BlogForm;
