import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { frontdeskAPI } from "../../lib/api";
import toast from "react-hot-toast";

const InquiryTab = () => {
    const [inquiries, setInquiries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        staff_id: 1,
        inquiry_type: "general",
        inquirer_name: "",
        inquirer_phone: "",
        inquirer_email: "",
        subject: "",
        details: "",
        priority: "medium",
    });

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        setIsLoading(true);
        try {
            const response = await frontdeskAPI.getInquiries({});
            setInquiries(response.data || []);
        } catch (error) {
            console.error("Failed to fetch inquiries:", error);
            toast.error("Failed to load inquiries");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await frontdeskAPI.createInquiry(formData);
            toast.success("Inquiry created successfully");
            setShowAddForm(false);
            setFormData({
                staff_id: 1,
                inquiry_type: "general",
                inquirer_name: "",
                inquirer_phone: "",
                inquirer_email: "",
                subject: "",
                details: "",
                priority: "medium",
            });
            fetchInquiries();
        } catch (error) {
            console.error("Failed to create inquiry:", error);
            toast.error("Failed to create inquiry");
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await frontdeskAPI.updateInquiry(id, { status });
            toast.success("Inquiry status updated");
            fetchInquiries();
        } catch (error) {
            console.error("Failed to update inquiry:", error);
            toast.error("Failed to update inquiry");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Inquiries</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="btn btn-primary flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Create Inquiry</span>
                </button>
            </div>

            {showAddForm && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Create New Inquiry</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Inquirer Name *
                            </label>
                            <input
                                type="text"
                                value={formData.inquirer_name}
                                onChange={(e) => setFormData({ ...formData, inquirer_name: e.target.value })}
                                required
                                className="input w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={formData.inquirer_phone}
                                onChange={(e) => setFormData({ ...formData, inquirer_phone: e.target.value })}
                                className="input w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Inquiry Type *
                            </label>
                            <select
                                value={formData.inquiry_type}
                                onChange={(e) => setFormData({ ...formData, inquiry_type: e.target.value })}
                                required
                                className="input w-full"
                            >
                                <option value="admission">Admission</option>
                                <option value="fees">Fees</option>
                                <option value="general">General</option>
                                <option value="complaint">Complaint</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Priority
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="input w-full"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Subject *
                            </label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                required
                                className="input w-full"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Details
                            </label>
                            <textarea
                                value={formData.details}
                                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                rows="3"
                                className="input w-full"
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end space-x-3">
                            <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inquirer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {inquiries.map((inquiry) => (
                                <tr key={inquiry.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{inquiry.inquirer_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{inquiry.inquiry_type}</td>
                                    <td className="px-6 py-4">{inquiry.subject}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${inquiry.priority === "high"
                                            ? "bg-red-100 text-red-700"
                                            : inquiry.priority === "medium"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-green-100 text-green-700"
                                            }`}>
                                            {inquiry.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={inquiry.status}
                                            onChange={(e) => handleStatusUpdate(inquiry.id, e.target.value)}
                                            className="input input-sm"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button className="text-blue-600 hover:text-blue-800">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InquiryTab;
