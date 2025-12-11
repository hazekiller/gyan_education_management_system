import { useState, useEffect } from "react";
import { Users, UserPlus, MessageSquare, Clock } from "lucide-react";
import { staffAPI, frontdeskAPI } from "../../lib/api";
import toast from "react-hot-toast";

const FrontDeskDashboard = ({ setActiveTab }) => {
    const [stats, setStats] = useState({
        totalStaff: 0,
        activeVisitors: 0,
        pendingInquiries: 0,
        todayVisitors: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        setIsLoading(true);
        try {
            // Get front desk staff count (designation = 'Frontdesk')
            const staffRes = await staffAPI.getAll({
                designation: 'Frontdesk',
                status: "active"
            });

            let totalStaff = 0;
            if (staffRes.data) {
                // Filter to ensure only Frontdesk staff
                const frontdeskStaff = staffRes.data.filter(
                    (staff) => staff.designation === 'Frontdesk'
                );
                totalStaff = frontdeskStaff.length;
            } else if (typeof staffRes.count === 'number') {
                totalStaff = staffRes.count;
            }

            // Get visitor logs (today's visitors and active visitors)
            let activeVisitors = 0;
            let todayVisitors = 0;

            try {
                const visitorsRes = await frontdeskAPI.getVisitors({
                    status: 'checked-in' // Get currently checked-in visitors
                });

                if (visitorsRes.data && Array.isArray(visitorsRes.data)) {
                    activeVisitors = visitorsRes.data.length;
                } else if (typeof visitorsRes.count === 'number') {
                    activeVisitors = visitorsRes.count;
                }
            } catch (error) {
                console.log("Visitor tracking not available:", error);
                activeVisitors = 0;
            }

            // Get today's total visitors
            try {
                const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
                const todayVisitorsRes = await frontdeskAPI.getVisitors({
                    date: today
                });

                if (todayVisitorsRes.data && Array.isArray(todayVisitorsRes.data)) {
                    todayVisitors = todayVisitorsRes.data.length;
                } else if (typeof todayVisitorsRes.count === 'number') {
                    todayVisitors = todayVisitorsRes.count;
                }
            } catch (error) {
                console.log("Today's visitor tracking not available:", error);
                todayVisitors = 0;
            }

            // Get pending inquiries
            let pendingInquiries = 0;

            try {
                const inquiriesRes = await frontdeskAPI.getInquiries({
                    status: 'pending' // Adjust based on your inquiry status values
                });

                if (inquiriesRes.data && Array.isArray(inquiriesRes.data)) {
                    pendingInquiries = inquiriesRes.data.length;
                } else if (typeof inquiriesRes.count === 'number') {
                    pendingInquiries = inquiriesRes.count;
                }
            } catch (error) {
                console.log("Inquiry tracking not available:", error);
                pendingInquiries = 0;
            }

            // Update stats with real data
            setStats({
                totalStaff,
                activeVisitors,
                pendingInquiries,
                todayVisitors,
            });

        } catch (error) {
            console.error("Failed to fetch dashboard stats:", error);
            toast.error("Failed to load dashboard statistics");
            // Keep previous stats or set to zero
            setStats({
                totalStaff: 0,
                activeVisitors: 0,
                pendingInquiries: 0,
                todayVisitors: 0,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const statCards = [
        {
            title: "Total Staff",
            value: stats.totalStaff,
            icon: Users,
            color: "blue",
            action: "staff",
        },
        {
            title: "Active Visitors",
            value: stats.activeVisitors,
            icon: UserPlus,
            color: "green",
            action: "visitors",
        },
        {
            title: "Pending Inquiries",
            value: stats.pendingInquiries,
            icon: MessageSquare,
            color: "yellow",
            action: "inquiries",
        },
        {
            title: "Today's Visitors",
            value: stats.todayVisitors,
            icon: Clock,
            color: "purple",
            action: "visitors",
        },
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="card animate-pulse">
                        <div className="h-24 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div
                        key={stat.title}
                        className="card hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => {
                            if (stat.action === "visitors") {
                                setActiveTab("visitors");
                            } else if (stat.action === "inquiries") {
                                setActiveTab("inquiries");
                            } else if (stat.action === "staff") {
                                setActiveTab("staff");
                            }
                        }}
                    >
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

            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => setActiveTab("visitors")}
                        className="btn btn-primary"
                    >
                        Check-in Visitor
                    </button>
                    <button
                        onClick={() => setActiveTab("inquiries")}
                        className="btn btn-secondary"
                    >
                        Create Inquiry
                    </button>
                    <button
                        onClick={() => setActiveTab("reports")}
                        className="btn btn-secondary"
                    >
                        View Reports
                    </button>
                </div>
            </div>

            {/* Refresh Stats Button */}
            <div className="text-right">
                <button
                    onClick={fetchDashboardStats}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                    Refresh Statistics
                </button>
            </div>
        </div>
    );
};

export default FrontDeskDashboard;