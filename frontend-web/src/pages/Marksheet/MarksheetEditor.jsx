import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FaSave, FaArrowLeft, FaPrint } from "react-icons/fa";

const MarksheetEditor = ({
    initialData = {},
    onSave,
    onCancel,
    isSaving = false,
}) => {
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");

    useEffect(() => {
        if (initialData) {
            setContent(initialData.content || "");
            setTitle(initialData.title || "");
        }
    }, [initialData]);

    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ script: "sub" }, { script: "super" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ direction: "rtl" }],
            [{ size: ["small", false, "large", "huge"] }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            ["clean"],
            ["link", "image", "table"],
        ],
    };

    const placeholders = [
        { label: "Student Name", value: "{{student_name}}" },
        { label: "Roll Number", value: "{{roll_number}}" },
        { label: "Class", value: "{{class}}" },
        { label: "Section", value: "{{section}}" },
        { label: "Admission Number", value: "{{admission_number}}" },
        { label: "Examination", value: "{{exam_name}}" },
        { label: "Academic Year", value: "{{academic_year}}" },
        { label: "Marks Table", value: "{{marks_table}}" },
        { label: "Total Marks", value: "{{total_marks}}" },
        { label: "Percentage", value: "{{percentage}}" },
        { label: "Grade", value: "{{grade}}" },
        { label: "Result Status", value: "{{result_status}}" },
    ];

    const insertPlaceholder = (value) => {
        const quill = document.querySelector(".ql-editor");
        if (quill) {
            quill.focus();
            document.execCommand("insertText", false, value);
        }
    };

    const handleSave = () => {
        onSave({ ...initialData, content, title });
    };

    return (
        <div className="bg-white min-h-screen flex flex-col">
            {/* Toolkit Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-10 w-full">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button
                        onClick={onCancel}
                        className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                        title="Back"
                    >
                        <FaArrowLeft />
                    </button>
                    <div className="flex-1 md:flex-initial">
                        <h2 className="text-xl font-bold text-gray-800">
                            {title || "Untitled Template"}
                        </h2>
                        <p className="text-xs text-gray-500">Marksheet Template Editor</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <FaPrint /> Print Preview
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaSave /> {isSaving ? "Saving..." : "Save Template"}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Sidebar for Placeholders */}
                <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        Placeholders
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                        Click to insert dynamic values into your template.
                    </p>
                    <div className="space-y-2">
                        {placeholders.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => insertPlaceholder(p.value)}
                                className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors text-sm font-medium text-gray-700"
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gray-100 flex justify-center">
                    {/* A4 Page Simulation */}
                    <div className={`bg-white shadow-lg w-full max-w-[210mm] min-h-[297mm] h-fit p-[20mm] flex flex-col`}>
                        <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={setContent}
                            modules={modules}
                            className="h-full"
                            style={{ height: '100%', border: 'none' }}
                        />
                    </div>
                </div>
            </div>

            <style>{`
        .ql-container {
            font-size: 14px;
            font-family: 'Times New Roman', Times, serif; 
            min-height: 250mm; /* approximate height within A4 padding */
        }
        .ql-toolbar {
            position: sticky;
            top: 0;
            background: white;
            z-index: 5;
            border-bottom: 1px solid #e5e7eb !important;
            border-top: none !important;
            border-left: none !important;
            border-right: none !important;
        }
        .ql-editor {
            min-height: 100%;
        }
        @media print {
            body * {
                visibility: hidden;
            }
            .ql-editor, .ql-editor * {
                visibility: visible;
            }
            .ql-editor {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 0;
            }
        }
      `}</style>
        </div>
    );
};

export default MarksheetEditor;
