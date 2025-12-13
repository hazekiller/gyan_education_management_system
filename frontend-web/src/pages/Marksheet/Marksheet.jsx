import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaFileAlt,
    FaSearch,
    FaTimes,
} from "react-icons/fa";
import api from "../../lib/api";
import toast from "react-hot-toast";

import MarksheetEditor from "./MarksheetEditor";

const Marksheet = () => {
    const [marksheets, setMarksheets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentMarksheet, setCurrentMarksheet] = useState(null);
    const [editorMode, setEditorMode] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        template_type: "exam",
        description: "",
    });
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchMarksheets();
    }, []);

    const fetchMarksheets = async () => {
        try {
            setLoading(true);
            const response = await api.get("/marksheets");
            if (response.data.success) {
                setMarksheets(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching marksheets:", error);
            // toast.error("Failed to load marksheets"); // reduced noise
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({
            title: "",
            template_type: "exam",
            description: "",
        });
        setIsEditing(false);
        setCurrentMarksheet(null);
    };

    const handleOpenModal = (marksheet = null) => {
        if (marksheet) {
            setIsEditing(true);
            setCurrentMarksheet(marksheet);
            setFormData({
                title: marksheet.title,
                template_type: marksheet.template_type,
                description: marksheet.description,
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (isEditing) {
                response = await api.put(`/marksheets/${currentMarksheet.id}`, formData);
                toast.success("Marksheet updated successfully");
            } else {
                response = await api.post("/marksheets", formData);
                toast.success("Marksheet created successfully");
                // Open editor immediately for new marksheet
                setCurrentMarksheet(response.data.data);
                setEditorMode(true);
            }
            fetchMarksheets();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving marksheet:", error);
            toast.error(error.response?.data?.message || "Failed to save marksheet");
        }
    };

    const handleEditorSave = async (updatedData) => {
        try {
            await api.put(`/marksheets/${updatedData.id}`, {
                content: updatedData.content,
                title: updatedData.title
            });
            toast.success("Template saved successfully");
            setEditorMode(false);
            fetchMarksheets();
        } catch (error) {
            console.error("Error saving template content:", error);
            toast.error("Failed to save template content");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this marksheet template?")) {
            try {
                await api.delete(`/marksheets/${id}`);
                toast.success("Marksheet deleted successfully");
                fetchMarksheets();
            } catch (error) {
                console.error("Error deleting marksheet:", error);
                toast.error("Failed to delete marksheet");
            }
        }
    };

    const openEditor = (marksheet) => {
        setCurrentMarksheet(marksheet);
        setEditorMode(true);
    };

    const filteredMarksheets = marksheets.filter((m) =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (editorMode && currentMarksheet) {
        return (
            <MarksheetEditor
                initialData={currentMarksheet}
                onSave={handleEditorSave}
                onCancel={() => setEditorMode(false)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-white text-black p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <FaFileAlt className="text-blue-600" />
                            Marksheet Management
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Manage exam and tournament marksheet templates
                        </p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm"
                    >
                        <FaPlus /> Create Marksheet
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Templates Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMarksheets.map((marksheet) => (
                            <div
                                key={marksheet.id}
                                className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-600 group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                        <FaFileAlt className="text-blue-600 text-xl" />
                                    </div>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full uppercase tracking-wide">
                                        {marksheet.template_type}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold mb-2 text-black line-clamp-1" title={marksheet.title}>
                                    {marksheet.title}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
                                    {marksheet.description || "No description provided"}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                                    <div className="text-xs text-gray-500">
                                        Updated: {new Date(marksheet.updated_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditor(marksheet)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Design Template"
                                        >
                                            <FaEdit /> Design
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(marksheet)}
                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Edit Details"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(marksheet.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredMarksheets.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <FaFileAlt className="mx-auto text-4xl text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No Templates Found</h3>
                        <p className="text-gray-500 mt-1">Get started by creating a new marksheet template.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
                        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
                            <h2 className="text-xl font-bold">
                                {isEditing ? "Edit Marksheet" : "Create Marksheet"}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Template Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-black"
                                    placeholder="e.g. Final Term Exam 2024"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Template Type
                                </label>
                                <select
                                    name="template_type"
                                    value={formData.template_type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-black bg-white"
                                >
                                    <option value="exam">Exam Template</option>
                                    <option value="tournament">Tournament Template</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-black resize-none"
                                    placeholder="e.g. Standard marksheet format for final term exams..."
                                ></textarea>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
                                >
                                    {isEditing ? "Update Details" : "Create & Design"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Marksheet;
