import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    Calendar,
    User,
    BookOpen,
    Users,
    CheckCircle,
    XCircle,
    TrendingUp,
    Award,
    AlertCircle,
    Target,
    Clock,
    FileText,
    Lightbulb,
    Package,
    MessageSquare
} from 'lucide-react';
import { dailyReportsAPI } from '../lib/api';

const DailyReportDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const role = useSelector(selectUserRole);
    const canManageReports = ['super_admin', 'admin', 'principal', 'hod'].includes(role);
    const queryClient = useQueryClient();
    const [feedback, setFeedback] = useState('');
    const [isEditingFeedback, setIsEditingFeedback] = useState(false);

    const { data: reportData, isLoading } = useQuery({
        queryKey: ['daily-report', id],
        queryFn: () => dailyReportsAPI.getById(id)
    });

    const report = reportData?.data;

    useEffect(() => {
        if (report?.feedback) {
            setFeedback(report.feedback);
        }
    }, [report]);

    const feedbackMutation = useMutation({
        mutationFn: (data) => dailyReportsAPI.addFeedback(id, data),
        onSuccess: () => {
            toast.success('Feedback added successfully');
            setIsEditingFeedback(false);
            queryClient.invalidateQueries(['daily-report', id]);
        },
        onError: (error) => toast.error(error.message || 'Failed to add feedback')
    });



    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-black mb-2">Report Not Found</h2>
                <p className="text-black mb-6">The daily report you're looking for doesn't exist.</p>
                <button
                    onClick={() => navigate('/reports')}
                    className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-medium"
                >
                    Back to Reports
                </button>
            </div>
        );
    }

    const InfoCard = ({ icon: Icon, label, value, bgColor = 'bg-blue-50', textColor = 'text-blue-700', borderColor = 'border-blue-100' }) => (
        <div className={`p-4 ${bgColor} rounded-lg border ${borderColor}`}>
            <div className="flex items-center gap-3">
                <Icon className={`w-6 h-6 ${textColor}`} />
                <div>
                    <p className={`text-xs font-medium ${textColor} uppercase`}>{label}</p>
                    <p className="text-lg font-bold text-black mt-1">{value}</p>
                </div>
            </div>
        </div>
    );

    const SectionCard = ({ icon: Icon, title, children, iconColor = 'text-blue-700' }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
                <Icon className={`w-5 h-5 ${iconColor}`} />
                <h3 className="text-lg font-bold text-black">{title}</h3>
            </div>
            {children}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/reports')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-black" />
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-black">Daily Work Report</h1>
                    <p className="text-black mt-1">
                        {new Date(report.report_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
            </div>

            {/* Teacher & Class Info */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 text-white">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-blue-100 uppercase font-medium">Teacher</p>
                            <p className="text-lg font-bold">{report.teacher_first_name} {report.teacher_last_name}</p>
                        </div>
                    </div>
                    {report.class_name && (
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-blue-100 uppercase font-medium">Class</p>
                                <p className="text-lg font-bold">{report.class_name} {report.section}</p>
                            </div>
                        </div>
                    )}
                    {report.subject_name && (
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-blue-100 uppercase font-medium">Subject</p>
                                <p className="text-lg font-bold">{report.subject_name}</p>
                            </div>
                        </div>
                    )}
                    {report.period_number && (
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-blue-100 uppercase font-medium">Period</p>
                                <p className="text-lg font-bold">Period {report.period_number}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Metrics */}
            {(report.students_present !== null || report.students_absent !== null || report.student_engagement || report.teaching_method) && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {report.students_present !== null && (
                        <InfoCard
                            icon={CheckCircle}
                            label="Students Present"
                            value={report.students_present}
                            bgColor="bg-green-50"
                            textColor="text-green-700"
                            borderColor="border-green-100"
                        />
                    )}
                    {report.students_absent !== null && (
                        <InfoCard
                            icon={XCircle}
                            label="Students Absent"
                            value={report.students_absent}
                            bgColor="bg-red-50"
                            textColor="text-red-700"
                            borderColor="border-red-100"
                        />
                    )}
                    {report.student_engagement && (
                        <InfoCard
                            icon={TrendingUp}
                            label="Student Engagement"
                            value={report.student_engagement.charAt(0).toUpperCase() + report.student_engagement.slice(1)}
                            bgColor="bg-purple-50"
                            textColor="text-purple-700"
                            borderColor="border-purple-100"
                        />
                    )}
                    {report.teaching_method && (
                        <InfoCard
                            icon={Lightbulb}
                            label="Teaching Method"
                            value={report.teaching_method}
                            bgColor="bg-yellow-50"
                            textColor="text-yellow-700"
                            borderColor="border-yellow-100"
                        />
                    )}
                </div>
            )}

            {/* Main Content */}
            <SectionCard icon={FileText} title="Daily Work Summary">
                <p className="text-black leading-relaxed whitespace-pre-wrap">{report.content}</p>
            </SectionCard>

            {/* Teaching Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {report.topics_covered && (
                    <SectionCard icon={BookOpen} title="Topics Covered" iconColor="text-indigo-600">
                        <p className="text-black leading-relaxed whitespace-pre-wrap">{report.topics_covered}</p>
                    </SectionCard>
                )}

                {report.homework_assigned && (
                    <SectionCard icon={Target} title="Homework Assigned" iconColor="text-orange-600">
                        <p className="text-black leading-relaxed whitespace-pre-wrap">{report.homework_assigned}</p>
                    </SectionCard>
                )}

                {report.resources_used && (
                    <SectionCard icon={Package} title="Resources Used" iconColor="text-teal-600">
                        <p className="text-black leading-relaxed whitespace-pre-wrap">{report.resources_used}</p>
                    </SectionCard>
                )}

                {report.next_class_plan && (
                    <SectionCard icon={Calendar} title="Next Class Plan" iconColor="text-blue-600">
                        <p className="text-black leading-relaxed whitespace-pre-wrap">{report.next_class_plan}</p>
                    </SectionCard>
                )}
            </div>

            {/* Observations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {report.challenges_faced && (
                    <SectionCard icon={AlertCircle} title="Challenges Faced" iconColor="text-red-600">
                        <p className="text-black leading-relaxed whitespace-pre-wrap">{report.challenges_faced}</p>
                    </SectionCard>
                )}

                {report.achievements && (
                    <SectionCard icon={Award} title="Achievements & Highlights" iconColor="text-green-600">
                        <p className="text-black leading-relaxed whitespace-pre-wrap">{report.achievements}</p>
                    </SectionCard>
                )}
            </div>

            {/* Additional Remarks */}
            {report.remarks && (
                <SectionCard icon={FileText} title="Additional Remarks" iconColor="text-gray-600">
                    <p className="text-black leading-relaxed whitespace-pre-wrap">{report.remarks}</p>
                </SectionCard>
            )}

            {/* Admin Feedback Section */}
            {(canManageReports || report.feedback) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-purple-600" />
                            <h3 className="text-lg font-bold text-black">Admin Feedback</h3>
                        </div>
                        {canManageReports && !isEditingFeedback && (
                            <button
                                onClick={() => setIsEditingFeedback(true)}
                                className="text-sm text-blue-700 hover:text-blue-800 font-medium"
                            >
                                {report.feedback ? 'Edit Feedback' : 'Add Feedback'}
                            </button>
                        )}
                    </div>

                    {isEditingFeedback ? (
                        <div className="space-y-3">
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter feedback for the teacher..."
                                rows="4"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setIsEditingFeedback(false);
                                        setFeedback(report.feedback || '');
                                    }}
                                    className="px-4 py-2 text-black hover:bg-gray-100 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => feedbackMutation.mutate({ feedback })}
                                    disabled={feedbackMutation.isPending}
                                    className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium disabled:opacity-50"
                                >
                                    {feedbackMutation.isPending ? 'Saving...' : 'Save Feedback'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className={`p-4 rounded-lg ${report.feedback ? 'bg-purple-50 border border-purple-100' : 'bg-gray-50 border border-gray-200 border-dashed'}`}>
                            {report.feedback ? (
                                <p className="text-black whitespace-pre-wrap">{report.feedback}</p>
                            ) : (
                                <p className="text-black italic text-center">No feedback provided yet.</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Footer Info */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between text-sm text-black">
                    <span>Submitted by: {report.creator_email}</span>
                    <span>Created: {new Date(report.created_at).toLocaleString()}</span>
                    {report.updated_at !== report.created_at && (
                        <span>Last Updated: {new Date(report.updated_at).toLocaleString()}</span>
                    )}
                </div>
            </div>

            {/* Back Button */}
            <div className="flex justify-center pt-4">
                <button
                    onClick={() => navigate('/reports')}
                    className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-medium transition-colors"
                >
                    Back to Reports
                </button>
            </div>
        </div>
    );
};

export default DailyReportDetails;
