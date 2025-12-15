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
    const [showPreviewModal, setShowPreviewModal] = useState(false);
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
            template_design: "schoolMarksheet",
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
                template_design: marksheet.template_design || "schoolMarksheet",
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

    const getSampleData = () => {
        return {
            school_name: "Gyan International School",
            school_address: "Kathmandu, Nepal",
            school_phone: "+977-1-4567890",
            school_email: "info@gyan.edu.np",
            college_name: "Gyan College of Management",
            college_affiliation: "Affiliated to Tribhuvan University",
            college_address: "Kathmandu, Nepal",
            college_logo: "🎓",
            student_name: "Sample Student",
            roll_number: "2024-001",
            registration_number: "REG-2024-001",
            class: "Class 10",
            section: "A",
            admission_number: "ADM-2024-001",
            exam_name: "Final Term Examination",
            academic_year: "2024-2025",
            program_name: "Bachelor of Business Administration",
            semester: "First Semester",
            session: "Regular",
            marks_table: `
                <tr style="background: white;">
                    <td style="border: 1px solid #333; padding: 10px; text-align: center;">1</td>
                    <td style="border: 1px solid #333; padding: 10px;">Mathematics</td>
                    <td style="border: 1px solid #333; padding: 10px; text-align: center;">100</td>
                    <td style="border: 1px solid #333; padding: 10px; text-align: center;">85</td>
                    <td style="border: 1px solid #333; padding: 10px; text-align: center;">A+</td>
                </tr>
                <tr style="background: #f9fafb;">
                    <td style="border: 1px solid #333; padding: 10px; text-align: center;">2</td>
                    <td style="border: 1px solid #333; padding: 10px;">Science</td>
                    <td style="border: 1px solid #333; padding: 10px; text-align: center;">100</td>
                    <td style="border: 1px solid #333; padding: 10px; text-align: center;">92</td>
                    <td style="border: 1px solid #333; padding: 10px; text-align: center;">A+</td>
                </tr>
                <tr style="background: white;">
                    <td style="border: 1px solid #333; padding: 10px; text-align: center;">3</td>
                    <td style="border: 1px solid #333; padding: 10px;">English</td>
                    <td style="border: 1px solid #333; padding: 10px; text-align: center;">100</td>
                    <td style="border: 1px solid #333; padding: 10px; text-align: center;">88</td>
                    <td style="border: 1px solid #333; padding: 10px; text-align: center;">A+</td>
                </tr>
                <tr style="background: #f9fafb;">
                    <td style="border: 1px solid #333; padding: 10px; text-align: center;">4</td>
                    <td style="border: 1px solid #333; padding: 10px;">Social Studies</td>
                    <td style="border: 1px solid #333; padding: 10px; text-align: center;">100</td>
                    <td style="border: 1px solid #333; padding: 10px; text-align: center;">90</td>
                    <td style="border: 1px solid #333; padding: 10px; text-align: center;">A+</td>
                </tr>
                <tr style="background: white;">
                    <td style="border: 1px solid #333; padding: 10px; text-align: center;">5</td>
                    <td style="border: 1px solid #333; padding: 10px;">Nepali</td>
                    <td style="border: 1px solid #333; padding: 10px; text-align: center;">100</td>
                    <td style="border: 1px solid #333; padding: 10px; text-align: center;">87</td>
                    <td style="border: 1px solid #333; padding: 10px; text-align: center;">A+</td>
                </tr>
            `,
            total_max_marks: "500",
            total_marks: "442",
            total_credits: "24",
            percentage: "88.4",
            grade: "A+",
            sgpa: "8.8",
            cgpa: "8.8",
            result_status: "PASS",
            teacher_remarks: "Excellent performance! Keep up the good work.",
            issue_date: new Date().toLocaleDateString(),
            transcript_id: "TRN-2024-001"
        };
    };

    const getTemplateContentByDesign = (templateDesign) => {
        // Import template designs from backend templates
        const templates = {
            schoolMarksheet: `
    <div style="font-family: 'Times New Roman', serif; padding: 40px; max-width: 210mm; margin: 0 auto; background: white;">
      <!-- Header -->
      <div style="text-align: center; border-bottom: 3px double #333; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="margin: 0; color: #1a365d; font-size: 32px; text-transform: uppercase; letter-spacing: 2px;">
          {{school_name}}
        </h1>
        <p style="margin: 5px 0; color: #666; font-size: 14px;">{{school_address}}</p>
        <p style="margin: 5px 0; color: #666; font-size: 14px;">Phone: {{school_phone}} | Email: {{school_email}}</p>
        <h2 style="margin: 20px 0 10px; color: #2d3748; font-size: 24px; text-transform: uppercase;">
          Academic Progress Report
        </h2>
        <p style="margin: 0; color: #666; font-size: 14px;">Academic Year: {{academic_year}}</p>
      </div>

      <!-- Student Information -->
      <div style="margin-bottom: 30px; background: #f7fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3182ce;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; width: 25%;"><strong>Student Name:</strong></td>
            <td style="padding: 8px 0; width: 25%;">{{student_name}}</td>
            <td style="padding: 8px 0; width: 25%;"><strong>Roll Number:</strong></td>
            <td style="padding: 8px 0; width: 25%;">{{roll_number}}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Class:</strong></td>
            <td style="padding: 8px 0;">{{class}}</td>
            <td style="padding: 8px 0;"><strong>Section:</strong></td>
            <td style="padding: 8px 0;">{{section}}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Admission No:</strong></td>
            <td style="padding: 8px 0;">{{admission_number}}</td>
            <td style="padding: 8px 0;"><strong>Examination:</strong></td>
            <td style="padding: 8px 0;">{{exam_name}}</td>
          </tr>
        </table>
      </div>

      <!-- Marks Table -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #2d3748; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #3182ce; padding-bottom: 8px;">
          Academic Performance
        </h3>
        <table style="width: 100%; border-collapse: collapse; border: 2px solid #333;">
          <thead>
            <tr style="background: #3182ce; color: white;">
              <th style="border: 1px solid #333; padding: 12px; text-align: left;">S.No</th>
              <th style="border: 1px solid #333; padding: 12px; text-align: left;">Subject</th>
              <th style="border: 1px solid #333; padding: 12px; text-align: center;">Max Marks</th>
              <th style="border: 1px solid #333; padding: 12px; text-align: center;">Marks Obtained</th>
              <th style="border: 1px solid #333; padding: 12px; text-align: center;">Grade</th>
            </tr>
          </thead>
          <tbody>
            {{marks_table}}
          </tbody>
          <tfoot>
            <tr style="background: #edf2f7; font-weight: bold;">
              <td colspan="2" style="border: 1px solid #333; padding: 12px; text-align: right;">Total:</td>
              <td style="border: 1px solid #333; padding: 12px; text-align: center;">{{total_max_marks}}</td>
              <td style="border: 1px solid #333; padding: 12px; text-align: center;">{{total_marks}}</td>
              <td style="border: 1px solid #333; padding: 12px; text-align: center;">-</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Result Summary -->
      <div style="margin-bottom: 30px; display: flex; gap: 20px;">
        <div style="flex: 1; background: #f7fafc; padding: 20px; border-radius: 8px; border: 1px solid #cbd5e0;">
          <p style="margin: 0 0 10px; color: #666; font-size: 14px;">Percentage</p>
          <p style="margin: 0; font-size: 28px; font-weight: bold; color: #3182ce;">{{percentage}}%</p>
        </div>
        <div style="flex: 1; background: #f7fafc; padding: 20px; border-radius: 8px; border: 1px solid #cbd5e0;">
          <p style="margin: 0 0 10px; color: #666; font-size: 14px;">Overall Grade</p>
          <p style="margin: 0; font-size: 28px; font-weight: bold; color: #2d3748;">{{grade}}</p>
        </div>
        <div style="flex: 1; background: #f7fafc; padding: 20px; border-radius: 8px; border: 1px solid #cbd5e0;">
          <p style="margin: 0 0 10px; color: #666; font-size: 14px;">Result</p>
          <p style="margin: 0; font-size: 28px; font-weight: bold; color: #38a169;">{{result_status}}</p>
        </div>
      </div>

      <!-- Signatures -->
      <div style="margin-top: 50px; display: flex; justify-content: space-between;">
        <div style="text-align: center; flex: 1;">
          <div style="border-top: 2px solid #333; padding-top: 8px; margin-top: 60px; display: inline-block; min-width: 150px;">
            <strong>Class Teacher</strong>
          </div>
        </div>
        <div style="text-align: center; flex: 1;">
          <div style="border-top: 2px solid #333; padding-top: 8px; margin-top: 60px; display: inline-block; min-width: 150px;">
            <strong>Principal</strong>
          </div>
        </div>
        <div style="text-align: center; flex: 1;">
          <div style="border-top: 2px solid #333; padding-top: 8px; margin-top: 60px; display: inline-block; min-width: 150px;">
            <strong>Parent/Guardian</strong>
          </div>
        </div>
      </div>
    </div>
  `,
            collegeTranscript: `
    <div style="font-family: 'Times New Roman', serif; padding: 40px; max-width: 210mm; margin: 0 auto; background: white;">
      <!-- Header with Logo Space -->
      <div style="text-align: center; border: 3px solid #1a365d; padding: 30px; margin-bottom: 30px; background: linear-gradient(to bottom, #f7fafc, white);">
        <div style="width: 80px; height: 80px; margin: 0 auto 15px; border: 2px solid #1a365d; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: white;">
          <span style="font-size: 36px; color: #1a365d; font-weight: bold;">{{college_logo}}</span>
        </div>
        <h1 style="margin: 0; color: #1a365d; font-size: 28px; text-transform: uppercase; letter-spacing: 3px; font-weight: bold;">
          {{college_name}}
        </h1>
        <p style="margin: 8px 0 0; color: #4a5568; font-size: 13px; font-style: italic;">{{college_affiliation}}</p>
        <p style="margin: 5px 0; color: #666; font-size: 12px;">{{college_address}}</p>
        <div style="margin-top: 20px; padding: 10px; background: #1a365d; color: white; display: inline-block; border-radius: 4px;">
          <h2 style="margin: 0; font-size: 20px; letter-spacing: 2px;">ACADEMIC TRANSCRIPT</h2>
        </div>
      </div>

      <!-- Student Information -->
      <div style="margin-bottom: 25px; border: 2px solid #cbd5e0; border-radius: 8px; overflow: hidden;">
        <div style="background: #2d3748; color: white; padding: 10px 20px;">
          <h3 style="margin: 0; font-size: 16px; letter-spacing: 1px;">STUDENT INFORMATION</h3>
        </div>
        <div style="padding: 20px; background: #f7fafc;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; width: 25%; font-weight: bold;">Name:</td>
              <td style="padding: 8px 0; width: 25%;">{{student_name}}</td>
              <td style="padding: 8px 0; width: 25%; font-weight: bold;">Registration No:</td>
              <td style="padding: 8px 0; width: 25%;">{{registration_number}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Program:</td>
              <td style="padding: 8px 0;">{{program_name}}</td>
              <td style="padding: 8px 0; font-weight: bold;">Semester:</td>
              <td style="padding: 8px 0;">{{semester}}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Semester Results -->
      <div style="margin-bottom: 25px;">
        <div style="background: #2d3748; color: white; padding: 10px 20px; border-radius: 4px 4px 0 0;">
          <h3 style="margin: 0; font-size: 16px; letter-spacing: 1px;">SEMESTER PERFORMANCE</h3>
        </div>
        <table style="width: 100%; border-collapse: collapse; border: 2px solid #2d3748;">
          <thead>
            <tr style="background: #4a5568; color: white;">
              <th style="border: 1px solid #2d3748; padding: 12px; text-align: left; font-size: 13px;">S.No</th>
              <th style="border: 1px solid #2d3748; padding: 12px; text-align: left; font-size: 13px;">Course Title</th>
              <th style="border: 1px solid #2d3748; padding: 12px; text-align: center; font-size: 13px;">Credits</th>
              <th style="border: 1px solid #2d3748; padding: 12px; text-align: center; font-size: 13px;">Grade</th>
            </tr>
          </thead>
          <tbody>
            {{marks_table}}
          </tbody>
        </table>
      </div>

      <!-- Semester Summary -->
      <div style="margin-bottom: 25px; background: #edf2f7; padding: 20px; border-radius: 8px; border: 2px solid #cbd5e0;">
        <div style="display: flex; gap: 30px; justify-content: space-around;">
          <div style="text-align: center;">
            <p style="margin: 0 0 5px; color: #666; font-size: 13px; font-weight: bold;">SGPA</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #3182ce;">{{sgpa}}</p>
          </div>
          <div style="text-align: center;">
            <p style="margin: 0 0 5px; color: #666; font-size: 13px; font-weight: bold;">CGPA</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #3182ce;">{{cgpa}}</p>
          </div>
          <div style="text-align: center;">
            <p style="margin: 0 0 5px; color: #666; font-size: 13px; font-weight: bold;">Percentage</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #2d3748;">{{percentage}}%</p>
          </div>
        </div>
      </div>

      <!-- Signatures -->
      <div style="margin-top: 60px; display: flex; justify-content: space-between; padding: 0 30px;">
        <div style="text-align: center;">
          <div style="border-top: 2px solid #2d3748; padding-top: 8px; margin-top: 50px; min-width: 180px;">
            <strong style="font-size: 13px;">Controller of Examinations</strong>
          </div>
        </div>
        <div style="text-align: center;">
          <div style="border-top: 2px solid #2d3748; padding-top: 8px; margin-top: 50px; min-width: 180px;">
            <strong style="font-size: 13px;">Principal/Dean</strong>
          </div>
        </div>
      </div>
    </div>
  `,
            termAssessment: `
    <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 210mm; margin: 0 auto; background: white;">
      <!-- Header -->
      <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
        <h1 style="margin: 0 0 10px; font-size: 26px; text-transform: uppercase; letter-spacing: 2px;">
          {{school_name}}
        </h1>
        <p style="margin: 0; font-size: 13px; opacity: 0.9;">{{school_address}}</p>
        <div style="margin-top: 15px; background: rgba(255,255,255,0.2); padding: 10px; border-radius: 6px; display: inline-block;">
          <h2 style="margin: 0; font-size: 18px; letter-spacing: 1px;">TERM ASSESSMENT REPORT</h2>
        </div>
      </div>

      <!-- Student Info Card -->
      <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; margin-bottom: 25px; border-left: 5px solid #667eea;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <p style="margin: 0 0 5px; color: #666; font-size: 12px; font-weight: bold;">STUDENT NAME</p>
            <p style="margin: 0; font-size: 16px; color: #2d3748;">{{student_name}}</p>
          </div>
          <div>
            <p style="margin: 0 0 5px; color: #666; font-size: 12px; font-weight: bold;">ROLL NUMBER</p>
            <p style="margin: 0; font-size: 16px; color: #2d3748;">{{roll_number}}</p>
          </div>
          <div>
            <p style="margin: 0 0 5px; color: #666; font-size: 12px; font-weight: bold;">CLASS & SECTION</p>
            <p style="margin: 0; font-size: 16px; color: #2d3748;">{{class}} - {{section}}</p>
          </div>
          <div>
            <p style="margin: 0 0 5px; color: #666; font-size: 12px; font-weight: bold;">TERM</p>
            <p style="margin: 0; font-size: 16px; color: #2d3748;">{{exam_name}}</p>
          </div>
        </div>
      </div>

      <!-- Marks Table -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #2d3748; margin-bottom: 12px; font-size: 16px; padding-bottom: 8px; border-bottom: 3px solid #667eea;">
          📊 Subject-wise Performance
        </h3>
        <table style="width: 100%; border-collapse: collapse; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
              <th style="padding: 14px; text-align: left; font-size: 13px;">S.No</th>
              <th style="padding: 14px; text-align: left; font-size: 13px;">Subject</th>
              <th style="padding: 14px; text-align: center; font-size: 13px;">Max Marks</th>
              <th style="padding: 14px; text-align: center; font-size: 13px;">Obtained</th>
              <th style="padding: 14px; text-align: center; font-size: 13px;">Grade</th>
            </tr>
          </thead>
          <tbody>
            {{marks_table}}
          </tbody>
        </table>
      </div>

      <!-- Performance Summary -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 4px 12px rgba(102,126,234,0.3);">
          <p style="margin: 0 0 8px; font-size: 12px; opacity: 0.9;">Total Marks</p>
          <p style="margin: 0; font-size: 28px; font-weight: bold;">{{total_marks}}</p>
        </div>
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 4px 12px rgba(245,87,108,0.3);">
          <p style="margin: 0 0 8px; font-size: 12px; opacity: 0.9;">Percentage</p>
          <p style="margin: 0; font-size: 28px; font-weight: bold;">{{percentage}}%</p>
        </div>
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 4px 12px rgba(79,172,254,0.3);">
          <p style="margin: 0 0 8px; font-size: 12px; opacity: 0.9;">Grade</p>
          <p style="margin: 0; font-size: 28px; font-weight: bold;">{{grade}}</p>
        </div>
      </div>

      <!-- Signatures -->
      <div style="margin-top: 50px; display: flex; justify-content: space-between; padding: 0 20px;">
        <div style="text-align: center;">
          <div style="border-top: 2px solid #2d3748; padding-top: 8px; margin-top: 50px; min-width: 150px;">
            <strong>Class Teacher</strong>
          </div>
        </div>
        <div style="text-align: center;">
          <div style="border-top: 2px solid #2d3748; padding-top: 8px; margin-top: 50px; min-width: 150px;">
            <strong>Parent's Signature</strong>
          </div>
        </div>
      </div>
    </div>
  `
        };

        return templates[templateDesign] || templates.schoolMarksheet;
    };

    const replacePlaceholders = (template, data) => {
        let result = template;
        Object.keys(data).forEach(key => {
            const placeholder = new RegExp(`{{${key}}}`, 'g');
            result = result.replace(placeholder, data[key]);
        });
        return result;
    };

    const handlePreview = () => {
        if (selectedTemplate) {
            setShowPreviewModal(true);
        }
    };

    const handleGeneratePDF = async () => {
        if (!selectedTemplate) return;

        try {
            const sampleData = getSampleData();
            const response = await api.post(`/marksheets/${selectedTemplate.id}/generate-pdf`, sampleData, {
                responseType: 'blob'
            });

            // Create a blob URL and trigger download
            const blob = new Blob([response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `marksheet_${selectedTemplate.title}_${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("PDF generated successfully!");
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Failed to generate PDF");
        }
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
                template_design: "schoolMarksheet",
                updated_at: new Date().toISOString(),
                isSample: true
            },
            {
                id: "sample-2",
                title: "College Transcript Template",
                template_type: "semester",
                description: "Professional semester-wise transcript layout for colleges and universities with GPA calculation fields.",
                template_design: "collegeTranscript",
                updated_at: new Date().toISOString(),
                isSample: true
            },
            {
                id: "sample-3",
                title: "Term Assessment Report",
                template_type: "test",
                description: "Simple and clean layout for periodic term assessments and unit tests.",
                template_design: "termAssessment",
                updated_at: new Date().toISOString(),
                isSample: true
            },
            {
                id: "sample-4",
                title: "Kindergarten Progress Report",
                template_type: "preschool",
                description: "Colorful and visual progress report designed specifically for kindergarten and preschool students.",
                template_design: "schoolMarksheet",
                updated_at: new Date().toISOString(),
                isSample: true
            },
            {
                id: "sample-5",
                title: "CBSE Format Report Card",
                template_type: "board",
                description: "Standardized marksheet format following CBSE board guidelines and grading systems.",
                template_design: "schoolMarksheet",
                updated_at: new Date().toISOString(),
                isSample: true
            },
            {
                id: "sample-6",
                title: "Skills & Activity Report",
                template_type: "activity",
                description: "Report card focused on co-curricular activities, skills, and behavioral assessment.",
                template_design: "termAssessment",
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
                                    {/* Preview and PDF buttons available for all templates */}
                                    <button
                                        onClick={handlePreview}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                                    >
                                        <FaFileAlt /> Preview
                                    </button>
                                    <button
                                        onClick={handleGeneratePDF}
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                                    >
                                        <FaFileAlt /> Generate PDF
                                    </button>

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
                                    Choose Template Design
                                </label>
                                <select
                                    name="template_design"
                                    value={formData.template_design}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-black bg-white"
                                >
                                    <option value="schoolMarksheet">Standard School Marksheet</option>
                                    <option value="collegeTranscript">College Transcript</option>
                                    <option value="termAssessment">Term Assessment Report</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Select the layout design for your marksheet
                                </p>
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

            {/* Preview Modal */}
            {showPreviewModal && selectedTemplate && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden transform transition-all my-8">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center text-white sticky top-0 z-10">
                            <h2 className="text-xl font-bold">
                                Preview: {selectedTemplate.title}
                            </h2>
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <div className="p-8 bg-gray-50 max-h-[80vh] overflow-y-auto">
                            <div
                                className="bg-white shadow-lg rounded-lg overflow-hidden"
                                dangerouslySetInnerHTML={{
                                    __html: selectedTemplate.content
                                        ? replacePlaceholders(selectedTemplate.content, getSampleData())
                                        : selectedTemplate.template_design
                                            ? replacePlaceholders(getTemplateContentByDesign(selectedTemplate.template_design), getSampleData())
                                            : '<div class="p-8 text-center text-gray-500">No template content available. Please design the layout first.</div>'
                                }}
                            />
                        </div>

                        <div className="px-6 py-4 bg-gray-100 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setShowPreviewModal(false);
                                    handleGeneratePDF();
                                }}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
                            >
                                Generate PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Marksheet;
