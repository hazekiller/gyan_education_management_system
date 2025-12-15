import React, { useState, useEffect } from 'react';
import { X, Image } from 'lucide-react';

const BlogForm = ({ blog, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        image: null,
        imagePreview: null,
        status: 'published'
    });

    useEffect(() => {
        if (blog) {
            setFormData({
                title: blog.title || '',
                content: blog.content || '',
                image: null,
                imagePreview: blog.image_url ? `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}${blog.image_url.startsWith('/') ? '' : '/'}${blog.image_url}` : null,
                status: blog.status || 'published'
            });
        }
    }, [blog]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file,
                imagePreview: URL.createObjectURL(file)
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            alert('Please fill in title and content');
            return;
        }
        onSubmit(formData);
    };

    return (
        <div className="bg-white rounded-xl w-full">
            <div className="p-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Cover Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                        {formData.imagePreview && (
                            <img
                                src={formData.imagePreview}
                                alt="Preview"
                                className="mt-3 w-full h-48 object-cover rounded-lg"
                            />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Title <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder="Enter blog title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg"
                        >
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Content <span className="text-red-600">*</span>
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={8}
                            className="w-full px-4 py-2 border rounded-lg font-sans"
                            placeholder="Write your blog post here..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            onClick={onCancel}
                            type="button"
                            className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Saving...' : (blog ? 'Update Post' : 'Publish Post')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogForm;
