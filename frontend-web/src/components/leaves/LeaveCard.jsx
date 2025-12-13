import { Calendar, Clock, FileText, User, Eye } from "lucide-react";

const LeaveCard = ({ leave, onApprove, onDecline, onView, isAdmin }) => {
    const getStatusBadge = (status) => {
        const styles = {
            pending: "bg-blue-50 text-blue-700 border-blue-200",
            approved: "bg-gray-100 text-gray-700 border-gray-200",
            declined: "bg-gray-100 text-gray-700 border-gray-200",
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
            sick: "bg-blue-100 text-blue-700",
            casual: "bg-blue-100 text-blue-700",
            emergency: "bg-blue-100 text-blue-700",
            other: "bg-gray-100 text-gray-700",
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

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-white font-semibold">
                        {leave.user_name?.charAt(0) || "U"}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            {leave.user_name || "Unknown User"}
                        </h3>
                        <p className="text-xs text-gray-500 capitalize">
                            {leave.user_type} {leave.user_identifier && `(${leave.user_identifier})`}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(leave.status)}
                    {getLeaveTypeBadge(leave.leave_type)}
                </div>
            </div>

            {/* Leave Details */}
            <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>
                        {new Date(leave.start_date).toLocaleDateString()} -{" "}
                        {new Date(leave.end_date).toLocaleDateString()}
                    </span>
                    <span className="ml-2 font-semibold text-blue-600">
                        ({leave.total_days} day{leave.total_days !== 1 ? "s" : ""})
                    </span>
                </div>

                <div className="flex items-start text-sm text-gray-600">
                    <FileText className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                    <p className="flex-1 line-clamp-2">{leave.reason}</p>
                </div>

                {leave.admin_remarks && (
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mt-3">
                        <p className="text-xs font-semibold text-gray-700 mb-1">
                            Admin Remarks:
                        </p>
                        <p className="text-sm text-gray-600">{leave.admin_remarks}</p>
                    </div>
                )}

                {leave.reviewed_by && (
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>
                            Reviewed by {leave.reviewer_name || leave.reviewer_email} on{" "}
                            {new Date(leave.reviewed_at).toLocaleDateString()}
                        </span>
                    </div>
                )}
            </div>

            {/* Admin Actions */}
            {isAdmin && (
                <div className="pt-3 border-t border-gray-200">
                    {leave.status === "pending" ? (
                        <div className="flex gap-2">
                            <button
                                onClick={() => onView && onView(leave)}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
                            >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                            </button>
                            <button
                                onClick={() => onApprove(leave)}
                                className="flex-1 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => onDecline(leave)}
                                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                Decline
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => onView && onView(leave)}
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default LeaveCard;
