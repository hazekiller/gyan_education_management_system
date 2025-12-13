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
    const [selectedTemplate, setSelectedTemplate] = useState(null);
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
            if (response.success) {
                setMarksheets(response.data || []);
            }
        } catch (error) {
            console.error("Error fetching marksheets:", error);
            // toast.error("Failed to load marksheets");
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
            // If it's a sample, we are creating a NEW one from it, not editing it.
            setIsEditing(!!marksheet.id && !marksheet.isSample);
            setCurrentMarksheet(marksheet);
            setFormData({
                title: marksheet.isSample ? `${marksheet.title} (Copy)` : marksheet.title,
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
                // Update local state if the edited item was selected
                if (selectedTemplate?.id === currentMarksheet.id) {
                    setSelectedTemplate(response.data);
                }
            } else {
                response = await api.post("/marksheets", formData);
                toast.success("Marksheet created successfully");
                // Select the new template
                setSelectedTemplate(response.data);
                // Open editor immediately if desired, or just show details
                // setCurrentMarksheet(response.data);
                // setEditorMode(true); 
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
            // Update selected template to reflect changes
            if (selectedTemplate?.id === updatedData.id) {
                setSelectedTemplate({ ...selectedTemplate, content: updatedData.content, title: updatedData.title });
            }
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
                if (selectedTemplate?.id === id) {
                    setSelectedTemplate(null);
                }
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

    // Filter logic
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

    // Default sample templates if no marksheets exist
    const displayMarksheets = marksheets.length === 0 && !loading && searchTerm === ""
        ? [
            {
                id: "sample-1",
                title: "Standard School Marksheet",
                template_type: "exam",
                description: "A comprehensive marksheet format suitable for primary and secondary schools including grade tables and remarks.",
                updated_at: new Date().toISOString(),
                isSample: true
            },
            {
                id: "sample-2",
                title: "College Transcript Template",
                template_type: "semester",
                description: "Professional semester-wise transcript layout for colleges and universities with GPA calculation fields.",
                updated_at: new Date().toISOString(),
                isSample: true
            },
            {
                id: "sample-3",
                title: "Term Assessment Report",
                template_type: "test",
                description: "Simple and clean layout for periodic term assessments and unit tests.",
                updated_at: new Date().toISOString(),
                isSample: true
            },
            {
                id: "sample-4",
                title: "Kindergarten Progress Report",
                template_type: "preschool",
                description: "Colorful and visual progress report designed specifically for kindergarten and preschool students.",
                updated_at: new Date().toISOString(),
                isSample: true
            },
            {
                id: "sample-5",
                title: "CBSE Format Report Card",
                template_type: "board",
                description: "Standardized marksheet format following CBSE board guidelines and grading systems.",
                updated_at: new Date().toISOString(),
                isSample: true
            },
            {
                id: "sample-6",
                title: "Skills & Activity Report",
                template_type: "activity",
                description: "Report card focused on co-curricular activities, skills, and behavioral assessment.",
                updated_at: new Date().toISOString(),
                isSample: true
            }
        ]
        : filteredMarksheets;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar - Templates List */}
            <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Templates</h2>
                            <p className="text-sm text-gray-600 mt-1">{marksheets.length} Total</p>
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            title="Create Template"
                        >
                            <FaPlus className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : displayMarksheets.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No matching templates found.</p>
                        </div>
                    ) : (
                        displayMarksheets.map((template) => (
                            <div
                                key={template.id}
                                onClick={() => setSelectedTemplate(template)}
                                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${selectedTemplate?.id === template.id
                                    ? "bg-blue-50 border-blue-500 shadow-md"
                                    : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedTemplate?.id === template.id ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"
                                        }`}>
                                        <FaFileAlt className="text-lg" />
                                    </div>
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase rounded-full">
                                        {template.template_type}
                                    </span>
                                </div>
                                <h3 className={`font-semibold text-sm line-clamp-1 ${selectedTemplate?.id === template.id ? "text-blue-900" : "text-gray-900"
                                    }`}>
                                    {template.title}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                    {template.isSample ? "Sample Template" : `Updated: ${new Date(template.updated_at).toLocaleDateString()}`}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content - Details */}
            <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
                {selectedTemplate ? (
                    <div className="flex-1 p-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-700 to-blue-800 p-8 text-white relative overflow-hidden">
                                <div className="relative z-10 flex justify-between items-start">
                                    <div className="flex items-start gap-6">
                                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                                            <FaFileAlt className="text-4xl text-white" />
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-bold mb-2">{selectedTemplate.title}</h1>
                                            <div className="flex items-center gap-3 text-blue-100">
                                                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm border border-white/10">
                                                    {selectedTemplate.template_type.replace('_', ' ').toUpperCase()}
                                                </span>
                                                <span className="text-sm border-l border-blue-400 pl-3">
                                                    Last updated: {new Date(selectedTemplate.updated_at).toLocaleDateString()}
                                                </span>
                                                {selectedTemplate.isSample && (
                                                    <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded font-bold uppercase">
                                                        Sample
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Toolbar */}
                            <div className="px-8 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
                                <div className="text-sm text-gray-500 font-medium">
                                    {selectedTemplate.isSample ?
                                        "Use this sample as a starting point for your own marksheet." :
                                        "Manage and customize this marksheet template."}
                                </div>

                                <div className="flex gap-3">
                                    {selectedTemplate.isSample ? (
                                        <button
                                            onClick={() => handleOpenModal(selectedTemplate)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                                        >
                                            <FaPlus /> Use Template
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => openEditor(selectedTemplate)}
                                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                                            >
                                                <FaEdit /> Design Layout
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(selectedTemplate)}
                                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium shadow-sm"
                                            >
                                                <FaEdit /> Edit Details
                                            </button>
                                            <button
                                                onClick={() => handleDelete(selectedTemplate.id)}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-lg transition-colors font-medium"
                                            >
                                                <FaTrash /> Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Content Preview / Details */}
                            <div className="p-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Description</h3>
                                <p className="text-gray-600 leading-relaxed mb-6">
                                    {selectedTemplate.description || "No description provided."}
                                </p>

                                <h3 className="text-lg font-bold text-gray-900 mb-4">Template Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Created Date</div>
                                        <div className="text-gray-900 font-medium">{selectedTemplate.created_at ? new Date(selectedTemplate.created_at).toLocaleDateString() : 'N/A'}</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Type</div>
                                        <div className="text-gray-900 font-medium capitalize">{selectedTemplate.template_type}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                            <FaFileAlt className="text-4xl text-blue-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a Template</h2>
                        <p className="text-gray-500 max-w-sm">
                            Choose a template from the sidebar to view details, edit its design, or manage its settings.
                        </p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
                        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
                            <h2 className="text-xl font-bold">
                                {isEditing ? "Edit Marksheet Details" : "Create New Marksheet"}
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
                                    <option value="semester">Semester</option>
                                    <option value="test">Class Test</option>
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
                                    {isEditing ? "Update Details" : "Create Template"}
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
