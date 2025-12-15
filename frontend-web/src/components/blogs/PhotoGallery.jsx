import React, { useState, useEffect } from 'react';
import { Image, Heart, MessageCircle, Eye, Calendar, User, Edit, Trash2, Plus, X, Search, Filter, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';

const PhotoGallery = () => {
    const [galleryItems, setGalleryItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [userRole, setUserRole] = useState('admin');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        blog_content: '',
        image: null,
        imagePreview: null,
        status: 'published'
    });

    const [comment, setComment] = useState('');

    // Sample data
    useEffect(() => {
        const sampleData = [
            {
                id: 1,
                title: 'Annual Sports Day 2024',
                description: 'Students participating in various sports activities',
                category: 'Events',
                image_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800',
                blog_content: 'Our annual sports day was filled with excitement and enthusiasm. Students from all grades participated in various athletic events including track and field, relay races, and team sports. The day was a testament to our commitment to physical education and sportsmanship.',
                author: 'Admin',
                first_name: 'John',
                last_name: 'Doe',
                role: 'admin',
                views: 245,
                likes_count: 34,
                comments_count: 12,
                created_at: new Date('2024-12-01'),
                comments: [
                    { id: 1, first_name: 'Sarah', last_name: 'Smith', comment: 'Amazing event!', created_at: new Date('2024-12-02') },
                    { id: 2, first_name: 'Mike', last_name: 'Johnson', comment: 'Great photos!', created_at: new Date('2024-12-03') }
                ]
            },
            {
                id: 2,
                title: 'Science Exhibition',
                description: 'Students showcasing innovative science projects',
                category: 'Academic',
                image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
                blog_content: 'The science exhibition showcased remarkable creativity and innovation from our students. Projects ranged from robotics to environmental science, demonstrating the depth of learning happening in our classrooms.',
                author: 'Teacher',
                first_name: 'Emily',
                last_name: 'Brown',
                role: 'teacher',
                views: 189,
                likes_count: 28,
                comments_count: 8,
                created_at: new Date('2024-11-28'),
                comments: []
            },
            {
                id: 3,
                title: 'Cultural Festival',
                description: 'Celebrating diversity through dance and music',
                category: 'Cultural',
                image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
                blog_content: 'Our cultural festival brought together students from different backgrounds to celebrate diversity through traditional dance, music, and art performances.',
                author: 'Admin',
                first_name: 'David',
                last_name: 'Wilson',
                role: 'admin',
                views: 312,
                likes_count: 45,
                comments_count: 15,
                created_at: new Date('2024-11-25'),
                comments: []
            },
            {
                id: 4,
                title: 'Computer Lab Upgrade',
                description: 'New technology integrated into our learning spaces',
                category: 'Infrastructure',
                image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800',
                blog_content: 'We have upgraded our computer labs with the latest technology to provide students with hands-on experience in programming, digital design, and modern software applications.',
                author: 'Admin',
                first_name: 'Lisa',
                last_name: 'Anderson',
                role: 'admin',
                views: 156,
                likes_count: 22,
                comments_count: 6,
                created_at: new Date('2024-11-20'),
                comments: []
            },
            {
                id: 5,
                title: 'Art Exhibition',
                description: 'Student artwork on display',
                category: 'Art',
                image_url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
                blog_content: 'Our art students displayed their incredible talent through paintings, sculptures, and digital art. The exhibition highlighted the importance of creative expression in education.',
                author: 'Teacher',
                first_name: 'Robert',
                last_name: 'Taylor',
                role: 'teacher',
                views: 203,
                likes_count: 31,
                comments_count: 9,
                created_at: new Date('2024-11-15'),
                comments: []
            },
            {
                id: 6,
                title: 'Library Renovation',
                description: 'Modern reading spaces for students',
                category: 'Infrastructure',
                image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
                blog_content: 'Our newly renovated library offers comfortable reading spaces, digital resources, and collaborative study areas to enhance the learning experience.',
                author: 'Admin',
                first_name: 'Jennifer',
                last_name: 'Martinez',
                role: 'admin',
                views: 178,
                likes_count: 26,
                comments_count: 7,
                created_at: new Date('2024-11-10'),
                comments: []
            }
        ];

        setGalleryItems(sampleData);
        setFilteredItems(sampleData);

        const cats = ['All', ...new Set(sampleData.map(item => item.category))];
        setCategories(cats);
    }, []);

    // Filter items
    useEffect(() => {
        let filtered = galleryItems;

        if (selectedCategory !== 'all' && selectedCategory !== 'All') {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }

        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredItems(filtered);
        setCurrentPage(1);
    }, [selectedCategory, searchTerm, galleryItems]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    const hasEditPermission = userRole === 'admin' || userRole === 'teacher';

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

    const handleSubmit = () => {
        if (!formData.title || !formData.category || !formData.imagePreview) {
            alert('Please fill in all required fields and select an image');
            return;
        }

        const newItem = {
            id: Math.max(...galleryItems.map(i => i.id), 0) + 1,
            ...formData,
            image_url: formData.imagePreview,
            author: userRole === 'admin' ? 'Admin' : 'Teacher',
            first_name: 'New',
            last_name: 'User',
            role: userRole,
            views: 0,
            likes_count: 0,
            comments_count: 0,
            created_at: new Date(),
            comments: []
        };

        setGalleryItems([newItem, ...galleryItems]);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: '',
            blog_content: '',
            image: null,
            imagePreview: null,
            status: 'published'
        });
        setShowForm(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            setGalleryItems(galleryItems.filter(item => item.id !== id));
            setShowModal(false);
        }
    };

    const handleLike = (id) => {
        setGalleryItems(galleryItems.map(item =>
            item.id === id ? { ...item, likes_count: item.likes_count + 1 } : item
        ));
        if (selectedItem && selectedItem.id === id) {
            setSelectedItem({ ...selectedItem, likes_count: selectedItem.likes_count + 1 });
        }
    };

    const handleComment = (id) => {
        if (!comment.trim()) return;

        const newComment = {
            id: Date.now(),
            first_name: 'Current',
            last_name: 'User',
            comment: comment,
            created_at: new Date()
        };

        setGalleryItems(galleryItems.map(item =>
            item.id === id
                ? {
                    ...item,
                    comments: [...item.comments, newComment],
                    comments_count: item.comments_count + 1
                }
                : item
        ));

        if (selectedItem && selectedItem.id === id) {
            setSelectedItem({
                ...selectedItem,
                comments: [...selectedItem.comments, newComment],
                comments_count: selectedItem.comments_count + 1
            });
        }

        setComment('');
    };

    const openModal = (item) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Photo Gallery & Blog</h1>
                            <p className="text-gray-600 mt-1">Visual stories from our school community</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <select
                                value={userRole}
                                onChange={(e) => setUserRole(e.target.value)}
                                className="px-4 py-2 border rounded-lg bg-white text-gray-900 font-medium"
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                            </select>
                            {hasEditPermission && (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add New
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search gallery..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 border rounded-lg bg-white font-medium"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                            ))}
                        </select>
                        <div className="flex gap-2 border rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">Add New Gallery Item</h2>
                                    <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">
                                            Image <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="w-full px-4 py-2 border rounded-lg"
                                        />
                                        {formData.imagePreview && (
                                            <img src={formData.imagePreview} alt="Preview" className="mt-3 w-full h-48 object-cover rounded-lg" />
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
                                            placeholder="Enter title"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2">
                                            Category <span className="text-red-600">*</span>
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg"
                                        >
                                            <option value="">Select category</option>
                                            <option value="Events">Events</option>
                                            <option value="Academic">Academic</option>
                                            <option value="Cultural">Cultural</option>
                                            <option value="Infrastructure">Infrastructure</option>
                                            <option value="Art">Art</option>
                                            <option value="Sports">Sports</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-2 border rounded-lg"
                                            placeholder="Brief description"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Blog Content</label>
                                        <textarea
                                            value={formData.blog_content}
                                            onChange={(e) => setFormData({ ...formData, blog_content: e.target.value })}
                                            rows={6}
                                            className="w-full px-4 py-2 border rounded-lg"
                                            placeholder="Full blog post content..."
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            onClick={resetForm}
                                            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            Publish
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Gallery Grid/List */}
                {currentItems.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl">
                        <Image className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600 text-lg">No items found</p>
                    </div>
                ) : (
                    <>
                        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                            {currentItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer ${viewMode === 'list' ? 'flex gap-4' : ''
                                        }`}
                                    onClick={() => openModal(item)}
                                >
                                    <img
                                        src={item.image_url}
                                        alt={item.title}
                                        className={viewMode === 'grid' ? 'w-full h-48 object-cover' : 'w-48 h-48 object-cover'}
                                    />
                                    <div className="p-4 flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-bold text-lg">{item.title}</h3>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                                {item.category}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                {item.views}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Heart className="w-4 h-4" />
                                                {item.likes_count}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MessageCircle className="w-4 h-4" />
                                                {item.comments_count}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`px-4 py-2 rounded-lg font-medium ${currentPage === i + 1
                                                ? 'bg-blue-600 text-white'
                                                : 'border hover:bg-gray-50'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Detail Modal */}
                {showModal && selectedItem && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="relative">
                                <img
                                    src={selectedItem.image_url}
                                    alt={selectedItem.title}
                                    className="w-full h-96 object-cover"
                                />
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-3xl font-bold mb-2">{selectedItem.title}</h2>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                {selectedItem.first_name} {selectedItem.last_name}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {selectedItem.created_at.toLocaleDateString()}
                                            </span>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                {selectedItem.category}
                                            </span>
                                        </div>
                                    </div>
                                    {hasEditPermission && (
                                        <button
                                            onClick={() => handleDelete(selectedItem.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>

                                <p className="text-gray-700 mb-4">{selectedItem.description}</p>

                                {selectedItem.blog_content && (
                                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                        <h3 className="font-bold text-lg mb-2">Full Story</h3>
                                        <p className="text-gray-700 whitespace-pre-wrap">{selectedItem.blog_content}</p>
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="flex items-center gap-6 mb-6 pb-6 border-b">
                                    <button
                                        onClick={() => handleLike(selectedItem.id)}
                                        className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                                    >
                                        <Heart className="w-5 h-5" />
                                        <span className="font-medium">{selectedItem.likes_count} Likes</span>
                                    </button>
                                    <span className="flex items-center gap-2 text-gray-600">
                                        <MessageCircle className="w-5 h-5" />
                                        <span className="font-medium">{selectedItem.comments_count} Comments</span>
                                    </span>
                                    <span className="flex items-center gap-2 text-gray-600">
                                        <Eye className="w-5 h-5" />
                                        <span className="font-medium">{selectedItem.views} Views</span>
                                    </span>
                                </div>

                                {/* Comments */}
                                <div>
                                    <h3 className="font-bold text-lg mb-4">Comments</h3>
                                    <div className="mb-4">
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Write a comment..."
                                            rows={3}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            onClick={() => handleComment(selectedItem.id)}
                                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                        >
                                            Post Comment
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {selectedItem.comments.map((c) => (
                                            <div key={c.id} className="p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-sm">
                                                        {c.first_name} {c.last_name}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {c.created_at.toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 text-sm">{c.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhotoGallery;