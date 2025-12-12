import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useSelector } from "react-redux";
import { selectUserRole } from "../../store/slices/authSlice";

// Helper function to normalize user role to database values
const normalizeUserType = (role) => {
    const roleMap = {
        'student': 'student',
        'teacher': 'teacher',
        'staff': 'staff',
        'admin': 'admin',
        'cleaner': 'staff',
        'frontdesk_staff': 'staff',
        'frontdesk': 'staff',
        'support_staff': 'staff',
    };

    // Convert to lowercase and look up in map
    const normalized = roleMap[role?.toLowerCase()] || 'staff';
    return normalized;
};

const LeaveForm = ({ leave, onSubmit, onCancel }) => {
    const role = useSelector(selectUserRole);

    // Normalize the role once when component mounts
    const normalizedRole = normalizeUserType(role);

    const [formData, setFormData] = useState({
        user_type: normalizedRole,
        leave_type: "casual",
        start_date: "",
        end_date: "",
        reason: "",
        supporting_document: null,
    });

    const [totalDays, setTotalDays] = useState(0);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (leave) {
            setFormData({
                user_type: leave.user_type || normalizedRole,
                leave_type: leave.leave_type,
                start_date: leave.start_date,
                end_date: leave.end_date,
                reason: leave.reason,
                supporting_document: null,
            });
        }
    }, [leave, normalizedRole]);

    // Calculate total days when dates change
    useEffect(() => {
        if (formData.start_date && formData.end_date) {
            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);

            if (end >= start) {
                const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                setTotalDays(days);
            } else {
                setTotalDays(0);
            }
        }
    }, [formData.start_date, formData.end_date]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "supporting_document" && files) {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        // Clear error for this field
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.leave_type) {
            newErrors.leave_type = "Leave type is required";
        }

        if (!formData.start_date) {
            newErrors.start_date = "Start date is required";
        }

        if (!formData.end_date) {
            newErrors.end_date = "End date is required";
        }

        if (formData.start_date && formData.end_date) {
            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);

            if (end < start) {
                newErrors.end_date = "End date must be after start date";
            }
        }

        if (!formData.reason || formData.reason.trim().length < 10) {
            newErrors.reason = "Reason must be at least 10 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        // Ensure user_type is normalized before submitting
        const dataToSubmit = {
            ...formData,
            user_type: normalizedRole
        };

        // Submit the form
        await onSubmit(dataToSubmit);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Leave Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leave Type *
                </label>
                <select
                    name="leave_type"
                    value={formData.leave_type}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.leave_type ? "border-red-500" : "border-gray-300"
                        }`}
                >
                    <option value="casual">Casual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="emergency">Emergency Leave</option>
                    <option value="other">Other</option>
                </select>
                {errors.leave_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.leave_type}</p>
                )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                    </label>
                    <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.start_date ? "border-red-500" : "border-gray-300"
                            }`}
                    />
                    {errors.start_date && (
                        <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date *
                    </label>
                    <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        min={formData.start_date}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.end_date ? "border-red-500" : "border-gray-300"
                            }`}
                    />
                    {errors.end_date && (
                        <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
                    )}
                </div>
            </div>

            {/* Total Days Display */}
            {totalDays > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                        <strong>Total Days:</strong> {totalDays} day{totalDays !== 1 ? "s" : ""}
                    </p>
                </div>
            )}

            {/* Reason */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason *
                </label>
                <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Please provide a detailed reason for your leave application..."
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.reason ? "border-red-500" : "border-gray-300"
                        }`}
                />
                {errors.reason && (
                    <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                )}
            </div>

            {/* Supporting Document */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supporting Document (Optional)
                </label>
                <input
                    type="file"
                    name="supporting_document"
                    onChange={handleChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                    Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 5MB)
                </p>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                    {leave ? "Update Leave" : "Submit Leave Application"}
                </button>
            </div>
        </form>
    );
};

export default LeaveForm;