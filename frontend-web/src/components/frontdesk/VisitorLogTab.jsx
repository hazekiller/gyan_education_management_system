import { useState, useEffect } from "react";
import { Plus, LogOut } from "lucide-react";
import { frontdeskAPI } from "../../lib/api";
import toast from "react-hot-toast";

const VisitorLogTab = () => {
    const [visitors, setVisitors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        staff_id: 1,
        visitor_name: "",
        visitor_phone: "",
        visitor_email: "",
        purpose: "admission_inquiry",
        person_to_meet: "",
        remarks: "",
    });

    useEffect(() => {
        fetchVisitors();
    }, []);

    const fetchVisitors = async () => {
        setIsLoading(true);
        try {
            const response = await frontdeskAPI.getVisitors({});
            setVisitors(response.data || []);
        } catch (error) {
            console.error("Failed to fetch visitors:", error);
            toast.error("Failed to load visitor logs");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await frontdeskAPI.logVisitor(formData);
            toast.success("Visitor checked in successfully");
            setShowAddForm(false);
            setFormData({
                staff_id: 1,
                visitor_name: "",
                visitor_phone: "",
                visitor_email: "",
                purpose: "admission_inquiry",
                person_to_meet: "",
                remarks: "",
            });
            fetchVisitors();
        } catch (error) {
            console.error("Failed to log visitor:", error);
            toast.error("Failed to check in visitor");
        }
    };

    const handleCheckout = async (id) => {
        try {
            await frontdeskAPI.checkoutVisitor(id);
            toast.success("Visitor checked out successfully");
            fetchVisitors();
        } catch (error) {
            console.error("Failed to checkout visitor:", error);
            toast.error("Failed to checkout visitor");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Visitor Logs</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="btn btn-primary flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Check-in Visitor</span>
                </button>
            </div>

            {showAddForm && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Check-in New Visitor</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Visitor Name *
                            </label>
                            <input
                                type="text"
                                value={formData.visitor_name}
                                onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
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
                                value={formData.visitor_phone}
                                onChange={(e) => setFormData({ ...formData, visitor_phone: e.target.value })}
                                className="input w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Purpose *
                            </label>
                            <select
                                value={formData.purpose}
                                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                required
                                className="input w-full"
                            >
                                <option value="admission_inquiry">Admission Inquiry</option>
                                <option value="meeting">Meeting</option>
                                <option value="complaint">Complaint</option>
                                <option value="document_submission">Document Submission</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Person to Meet
                            </label>
                            <input
                                type="text"
                                value={formData.person_to_meet}
                                onChange={(e) => setFormData({ ...formData, person_to_meet: e.target.value })}
                                className="input w-full"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Remarks
                            </label>
                            <textarea
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                rows="2"
                                className="input w-full"
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end space-x-3">
                            <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Check-in
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitor Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {visitors.map((visitor) => (
                                <tr key={visitor.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{visitor.visitor_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{visitor.visitor_phone || "N/A"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{visitor.purpose}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(visitor.check_in_time).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {visitor.check_out_time ? new Date(visitor.check_out_time).toLocaleString() : "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {!visitor.check_out_time && (
                                            <button
                                                onClick={() => handleCheckout(visitor.id)}
                                                className="btn btn-sm bg-green-50 text-green-600 hover:bg-green-100"
                                            >
                                                <LogOut className="w-4 h-4 mr-1" />
                                                Check-out
                                            </button>
                                        )}
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

export default VisitorLogTab;
