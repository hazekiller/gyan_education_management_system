import VisitorLogTab from "../components/frontdesk/VisitorLogTab";

const Visitors = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Visitor Management</h1>
                    <p className="text-gray-600 mt-1">Track and manage daily visitors</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <VisitorLogTab />
            </div>
        </div>
    );
};

export default Visitors;
