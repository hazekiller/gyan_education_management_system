import { useState } from "react";
import { Users, UserPlus, ClipboardList, MessageSquare, BarChart3, FileText } from "lucide-react";
import FrontDeskStaffTab from "../components/frontdesk/FrontDeskStaffTab";
import VisitorLogTab from "../components/frontdesk/VisitorLogTab";
import InquiryTab from "../components/frontdesk/InquiryTab";
import ReportsTab from "../components/frontdesk/ReportsTab";
import FrontDeskDashboard from "../components/frontdesk/FrontDeskDashboard";

const FrontDesk = () => {
    const [activeTab, setActiveTab] = useState("dashboard");

    const tabs = [
        { id: "dashboard", label: "Dashboard", icon: BarChart3 },
        { id: "staff", label: "Front Desk Staff", icon: Users },
        { id: "visitors", label: "Visitor Log", icon: UserPlus },
        { id: "inquiries", label: "Inquiries", icon: MessageSquare },
        { id: "reports", label: "Reports", icon: FileText },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Front Desk Management</h1>
                    <p className="text-gray-600 mt-1">Manage front desk staff, visitors, and inquiries</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm 
                                transition-colors duration-200 flex items-center space-x-2
                                ${activeTab === tab.id
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }
                            `}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === "dashboard" && <FrontDeskDashboard setActiveTab={setActiveTab} />}
                {activeTab === "staff" && <FrontDeskStaffTab />}
                {activeTab === "visitors" && <VisitorLogTab />}
                {activeTab === "inquiries" && <InquiryTab />}
                {activeTab === "reports" && <ReportsTab />}
            </div>
        </div>
    );
};

export default FrontDesk;
