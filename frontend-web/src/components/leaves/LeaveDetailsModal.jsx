import { X, Calendar, Clock, FileText, User, Download, Eye } from "lucide-react";
import Modal from "../common/Modal";
import AuthenticatedImage from "../common/AuthenticatedImage";

const LeaveDetailsModal = ({ isOpen, onClose, leave }) => {
    if (!leave) return null;

    const getStatusBadge = (status) => {
        const styles = {
            pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
            approved: "bg-green-100 text-green-800 border-green-200",
            declined: "bg-red-100 text-red-800 border-red-200",
        };

        return (
            <span
                className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status] || "bg-gray-100 text-gray-800 border-gray-200"
                    }`}
            >
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getLeaveTypeBadge = (type) => {
        const styles = {
            sick: "bg-purple-100 text-purple-800",
            casual: "bg-blue-100 text-blue-800",
            emergency: "bg-red-100 text-red-800",
            other: "bg-gray-100 text-gray-800",
        };

        return (
            <span
                className={`px-2 py-1 text-xs font-medium rounded ${styles[type] || "bg-gray-100 text-gray-800"
                    }`}
            >
                {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
        );
    };

    const handleDownloadDocument = () => {
        if (leave.supporting_document) {
            // Extract the path after 'uploads/'
            const filePath = leave.supporting_document.replace(/^uploads\//, '');
            const token = localStorage.getItem('token');
            // VITE_API_URL already includes /api, so just append /files/
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const fileUrl = `${apiBase}/files/${filePath}`;

            // Download with authentication
            fetch(fileUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to download file');
                    return response.blob();
                })
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filePath.split('/').pop();
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                })
                .catch(error => {
                    console.error('Download error:', error);
                    alert('Failed to download file. Please try again.');
                });
        }
    };



    const isImageFile = (filename) => {
        if (!filename) return false;
        const ext = filename.toLowerCase().split('.').pop();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext);
    };

    const isPdfFile = (filename) => {
        if (!filename) return false;
        return filename.toLowerCase().endsWith('.pdf');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Leave Application Details" size="lg">
            <div className="space-y-6">
                {/* Applicant Information */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-5 border border-blue-100">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {leave.user_name?.charAt(0) || "U"}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900">
                                {leave.user_name || "Unknown User"}
                            </h3>
                            <p className="text-sm text-gray-600 capitalize">
                                {leave.user_type} {leave.user_identifier && `• ${leave.user_identifier}`}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {leave.user_email}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(leave.status)}
                            {getLeaveTypeBadge(leave.leave_type)}
                        </div>
                    </div>
                </div>

                {/* Leave Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center text-gray-600 mb-2">
                            <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                            <span className="font-semibold">Start Date</span>
                        </div>
                        <p className="text-gray-900 font-medium ml-7">
                            {new Date(leave.start_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center text-gray-600 mb-2">
                            <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                            <span className="font-semibold">End Date</span>
                        </div>
                        <p className="text-gray-900 font-medium ml-7">
                            {new Date(leave.end_date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center text-gray-600 mb-2">
                            <Clock className="w-5 h-5 mr-2 text-blue-500" />
                            <span className="font-semibold">Duration</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600 ml-7">
                            {leave.total_days} {leave.total_days === 1 ? 'Day' : 'Days'}
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center text-gray-600 mb-2">
                            <Clock className="w-5 h-5 mr-2 text-gray-500" />
                            <span className="font-semibold">Applied On</span>
                        </div>
                        <p className="text-gray-900 font-medium ml-7">
                            {new Date(leave.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                {/* Reason */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start text-gray-600 mb-2">
                        <FileText className="w-5 h-5 mr-2 mt-0.5 text-gray-500" />
                        <span className="font-semibold">Reason for Leave</span>
                    </div>
                    <p className="text-gray-900 ml-7 whitespace-pre-wrap">
                        {leave.reason}
                    </p>
                </div>

                {/* Supporting Document */}
                {leave.supporting_document && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center text-gray-600">
                                <FileText className="w-5 h-5 mr-2 text-gray-500" />
                                <span className="font-semibold">Supporting Document</span>
                            </div>
                            <button
                                onClick={handleDownloadDocument}
                                className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                            >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                            </button>
                        </div>

                        {/* Document Preview */}
                        <div className="ml-7 mt-3">
                            {isImageFile(leave.supporting_document) ? (
                                <div className="border border-gray-300 rounded-lg overflow-hidden">
                                    <AuthenticatedImage
                                        src={leave.supporting_document}
                                        alt="Supporting document"
                                        className="w-full h-auto max-h-96 object-contain bg-white"
                                    />
                                </div>
                            ) : isPdfFile(leave.supporting_document) ? (
                                <div className="bg-white border border-gray-300 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-3">
                                        PDF preview requires download. Click the Download button above to view the document.
                                    </p>
                                    <div className="flex items-center justify-center p-8 bg-gray-50 rounded">
                                        <FileText className="w-12 h-12 text-gray-400" />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center p-8 bg-white border border-gray-300 rounded-lg">
                                    <div className="text-center">
                                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">
                                            {leave.supporting_document.split('/').pop()}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Click download to view this file
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Admin Remarks */}
                {leave.admin_remarks && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-amber-900 mb-2">
                            Admin Remarks:
                        </p>
                        <p className="text-gray-800 whitespace-pre-wrap">
                            {leave.admin_remarks}
                        </p>
                    </div>
                )}

                {/* Review Information */}
                {leave.reviewed_by && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center text-sm text-gray-600">
                            <User className="w-4 h-4 mr-2 text-gray-500" />
                            <span>
                                Reviewed by <strong>{leave.reviewer_name || leave.reviewer_email}</strong> on{" "}
                                {new Date(leave.reviewed_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    </div>
                )}

                {/* Close Button */}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default LeaveDetailsModal;
