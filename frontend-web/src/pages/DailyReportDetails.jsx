import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, FileText, Clock } from 'lucide-react';
import { dailyReportsAPI } from '../lib/api';

const DailyReportDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ['daily-report', id],
        queryFn: () => dailyReportsAPI.getById(id)
    });

    const report = data?.data;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="loading"></div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Report not found</p>
                <button onClick={() => navigate('/reports')} className="btn btn-link mt-4">
                    Back to Reports
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <button
                onClick={() => navigate('/reports')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Reports</span>
            </button>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <FileText className="w-6 h-6" />
                        Daily Report
                    </h1>
                    <p className="text-blue-100 mt-1">
                        {new Date(report.report_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Teacher</p>
                                <p className="font-medium text-gray-900">
                                    {report.teacher_first_name} {report.teacher_last_name}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-full text-purple-600">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Created By</p>
                                <p className="font-medium text-gray-900">{report.creator_email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-full text-green-600">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Last Updated</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(report.updated_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">Report Content</h3>
                        <div className="prose max-w-none text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                            {report.content}
                        </div>
                    </div>

                    {/* Remarks */}
                    {report.remarks && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">Remarks</h3>
                            <div className="prose max-w-none text-gray-600 whitespace-pre-wrap italic bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                {report.remarks}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DailyReportDetails;
