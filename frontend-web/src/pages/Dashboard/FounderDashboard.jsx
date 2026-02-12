import React from 'react';
import AccountsDashboard from './AccountsDashboard';
import HRDashboard from './HRDashboard';

const FounderDashboard = () => {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-8 text-indigo-900 border-b pb-4">Founder's Overview</h1>

            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Financial Overview (Real-Time)</h2>
                <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                    <AccountsDashboard />
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">HR & Staff Overview</h2>
                <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                    <HRDashboard />
                </div>
            </section>
        </div>
    );
};

export default FounderDashboard;
