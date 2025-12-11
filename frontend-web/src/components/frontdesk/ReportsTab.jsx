import { useState, useEffect } from "react";
import { FileText, Calendar, TrendingUp, Users } from "lucide-react";
import { frontdeskAPI } from "../../lib/api";
import toast from "react-hot-toast";

const ReportsTab = () => {
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });
    const [reportData, setReportData] = useState({
        totalVisitors: 0,
        totalInquiries: 0,
        pendingInquiries: 0,
        resolvedInquiries: 0,
        visitorsByPurpose: {},
        inquiriesByType: {},
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchReportData();
    }, [dateRange]);

    const fetchReportData = async () => {
        setIsLoading(true);
        try {
            // Fetch visitors and inquiries data
            const [visitorsRes, inquiriesRes] = await Promise.all([
                frontdeskAPI.getVisitors({}),
                frontdeskAPI.getInquiries({}),
            ]);

            const visitors = visitorsRes.data || [];
            const inquiries = inquiriesRes.data || [];

            // Filter by date range
            const filteredVisitors = visitors.filter(v => {
                const checkInDate = new Date(v.check_in_time).toISOString().split('T')[0];
                return checkInDate >= dateRange.startDate && checkInDate <= dateRange.endDate;
            });

            const filteredInquiries = inquiries.filter(i => {
                const createdDate = new Date(i.created_at).toISOString().split('T')[0];
                return createdDate >= dateRange.startDate && createdDate <= dateRange.endDate;
            });

            // Calculate statistics
            const visitorsByPurpose = filteredVisitors.reduce((acc, v) => {
                acc[v.purpose] = (acc[v.purpose] || 0) + 1;
                return acc;
            }, {});

            const inquiriesByType = filteredInquiries.reduce((acc, i) => {
                acc[i.inquiry_type] = (acc[i.inquiry_type] || 0) + 1;
                return acc;
            }, {});

            const pendingInquiries = filteredInquiries.filter(i => i.status === 'pending').length;
            const resolvedInquiries = filteredInquiries.filter(i => i.status === 'resolved' || i.status === 'closed').length;

            setReportData({
                totalVisitors: filteredVisitors.length,
                totalInquiries: filteredInquiries.length,
                pendingInquiries,
                resolvedInquiries,
                visitorsByPurpose,
                inquiriesByType,
            });
        } catch (error) {
            console.error("Failed to fetch report data:", error);
            toast.error("Failed to load report data");
        } finally {
            setIsLoading(false);
        }
    };

    const statCards = [
        {
            title: "Total Visitors",
            value: reportData.totalVisitors,
            icon: Users,
            color: "blue",
        },
        {
            title: "Total Inquiries",
            value: reportData.totalInquiries,
            icon: FileText,
            color: "green",
        },
        {
            title: "Pending Inquiries",
            value: reportData.pendingInquiries,
            icon: TrendingUp,
            color: "yellow",
        },
        {
            title: "Resolved Inquiries",
            value: reportData.resolvedInquiries,
            icon: TrendingUp,
            color: "purple",
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Front Desk Reports</h2>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">From:</label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                            className="input"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">To:</label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                            className="input"
                        />
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.title} className="card hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                                <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Visitors by Purpose */}
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitors by Purpose</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {Object.entries(reportData.visitorsByPurpose).map(([purpose, count]) => (
                                <tr key={purpose}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {purpose.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{count}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {reportData.totalVisitors > 0
                                            ? ((count / reportData.totalVisitors) * 100).toFixed(1)
                                            : 0}%
                                    </td>
                                </tr>
                            ))}
                            {Object.keys(reportData.visitorsByPurpose).length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No visitor data for selected date range
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Inquiries by Type */}
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inquiries by Type</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {Object.entries(reportData.inquiriesByType).map(([type, count]) => (
                                <tr key={type}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{count}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {reportData.totalInquiries > 0
                                            ? ((count / reportData.totalInquiries) * 100).toFixed(1)
                                            : 0}%
                                    </td>
                                </tr>
                            ))}
                            {Object.keys(reportData.inquiriesByType).length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No inquiry data for selected date range
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsTab;
