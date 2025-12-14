import { useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowLeft,
    Download,
    Printer,
    Search,
    BookOpen,
    Filter,
    AlertCircle,
} from "lucide-react";
import {
    examsAPI,
    examScheduleAPI,
    studentsAPI,
} from "../lib/api";
import { useReactToPrint } from "react-to-print";

const ExamReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const componentRef = useRef();

    const [searchTerm, setSearchTerm] = useState("");

    // 1. Fetch Exam Details
    const { data: examData, isLoading: isLoadingExam } = useQuery({
        queryKey: ["exam", id],
        queryFn: () => examsAPI.getById(id),
    });

    const exam = examData?.data;

    // 2. Fetch Exam Schedules (to get subjects and max marks)
    const { data: schedulesData, isLoading: isLoadingSchedules } = useQuery({
        queryKey: ["exam-schedules", id],
        queryFn: () => examScheduleAPI.getExamSchedules(id),
        enabled: !!id,
    });

    const schedules = useMemo(() => schedulesData?.data || [], [schedulesData]);

    // 3. Fetch Students (Rows) - Need class_id from exam
    const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
        queryKey: ["students", exam?.class_id],
        queryFn: () =>
            studentsAPI.getAll({ class_id: exam?.class_id, status: "active", limit: 1000 }), // Get all active students
        enabled: !!exam?.class_id,
    });

    const students = useMemo(() => studentsData?.data || [], [studentsData]);

    // 4. Fetch All Results (Cells)
    const { data: resultsData, isLoading: isLoadingResults } = useQuery({
        queryKey: ["exam-results-all", id],
        queryFn: () => examsAPI.getResults(id), // This returns all results for the exam
        enabled: !!id,
    });

    const results = useMemo(() => resultsData?.data || [], [resultsData]);

    // Handle Print
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Exam_Report_${exam?.name || id}`,
    });

    // Process Data for the Table
    // Map: StudentID -> { subjectId: { marks, grade, max_marks } }
    const processedData = useMemo(() => {
        const data = {};

        // Initialize student entries
        students.forEach((student) => {
            data[student.id] = {
                studentInfo: student,
                subjects: {},
                totalObtained: 0,
                totalMax: 0,
                subjectCount: 0,
                failedSubjects: 0,
            };
        });

        // Populate results
        results.forEach((result) => {
            if (data[result.student_id]) {
                data[result.student_id].subjects[result.subject_id] = {
                    marks: result.marks_obtained,
                    grade: result.grade,
                    max_marks: result.max_marks,
                };
            }
        });

        // Calculate Totals per student (only for subjects in schedule to avoid strays)
        Object.values(data).forEach((entry) => {
            schedules.forEach((schedule) => {
                const result = entry.subjects[schedule.subject_id];
                if (result) {
                    entry.totalObtained += parseFloat(result.marks);
                    entry.totalMax += parseFloat(result.max_marks);
                    entry.subjectCount++;

                    // Check pass/fail
                    if (parseFloat(result.marks) < schedule.passing_marks) {
                        entry.failedSubjects++;
                    }
                } else {
                    // Absent or not entered
                    // You might treat this as fail or just ignore depending on policy
                    // entry.failedSubjects++; // strict mode
                }
            });

            entry.percentage = entry.totalMax > 0
                ? ((entry.totalObtained / entry.totalMax) * 100).toFixed(2)
                : 0;
        });

        return data;
    }, [students, results, schedules]);

    // Group schedules by subject to handle potential duplicates (though unlikely in schedule)
    // We just need a list of unique subjects (columns)
    const subjectColumns = useMemo(() => {
        // Sort by date/time if available in schedule, otherwise subject name
        return schedules.sort((a, b) => {
            if (a.exam_date === b.exam_date) return a.start_time.localeCompare(b.start_time);
            return new Date(a.exam_date) - new Date(b.exam_date);
        });
    }, [schedules]);

    // Filter students based on search
    const filteredStudents = useMemo(() => {
        if (!searchTerm) return students;
        const lowerTerm = searchTerm.toLowerCase();
        return students.filter(s =>
            s.first_name.toLowerCase().includes(lowerTerm) ||
            s.last_name.toLowerCase().includes(lowerTerm) ||
            s.roll_number?.toString().includes(lowerTerm) ||
            s.admission_number?.includes(lowerTerm)
        );
    }, [students, searchTerm]);


    if (isLoadingExam || isLoadingSchedules || isLoadingStudents || isLoadingResults) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Exam Not Found</h2>
                <button
                    onClick={() => navigate('/exams')}
                    className="mt-4 btn btn-primary"
                >
                    Back to Exams
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate(`/exams/${id}`)}
                        className="btn btn-outline flex items-center space-x-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Exam Report</h1>
                        <p className="text-gray-600">
                            {exam.name} ({exam.academic_year})
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        className="btn btn-outline flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </button>
                    <button className="btn btn-primary flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow-md p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search student by name, roll no..."
                        className="input pl-10 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-semibold">{students.length}</span> Students
                    <span className="w-px h-4 bg-gray-300 mx-2"></span>
                    <span className="font-semibold">{schedules.length}</span> Subjects
                </div>
            </div>

            {/* Broadsheet Table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow-md" ref={componentRef}>
                {/* Print Letterhead (Hidden in screen) */}
                <div className="hidden print:block text-center mb-6 p-4">
                    <h1 className="text-2xl font-bold">GYAN SCHOOL</h1>
                    <p className="text-sm">Exam Report: {exam.name}</p>
                    <p className="text-sm">Class: {exam.class_name} | Year: {exam.academic_year}</p>
                </div>

                <table className="min-w-full divide-y divide-gray-200 border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left test-xs font-bold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-b border-r border-gray-200 min-w-[50px]">
                                Roll
                            </th>
                            <th className="px-4 py-3 text-left test-xs font-bold text-gray-500 uppercase tracking-wider sticky left-[50px] bg-gray-50 z-10 border-b border-r border-gray-200 min-w-[150px]">
                                Student Name
                            </th>
                            {subjectColumns.map((schedule) => (
                                <th key={schedule.id} className="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 min-w-[80px]">
                                    <div>{schedule.subject_name}</div>
                                    <div className="text-[10px] font-normal text-gray-400">FM: {schedule.max_marks}</div>
                                </th>
                            ))}
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-l border-gray-200 bg-gray-50">
                                Total
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
                                %
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
                                Result
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {filteredStudents.sort((a, b) => (a.roll_number || 9999) - (b.roll_number || 9999)).map((student) => {
                            const data = processedData[student.id];
                            return (
                                <tr key={student.id} className="hover:bg-gray-50 group">
                                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 sticky left-0 bg-white group-hover:bg-gray-50 border-r border-gray-200">
                                        {student.roll_number || "-"}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-900 sticky left-[50px] bg-white group-hover:bg-gray-50 border-r border-gray-200 font-medium">
                                        {student.first_name} {student.last_name}
                                    </td>

                                    {/* Subject Marks */}
                                    {subjectColumns.map((schedule) => {
                                        const subjectResult = data.subjects[schedule.subject_id];
                                        const isFail = subjectResult && parseFloat(subjectResult.marks) < schedule.passing_marks;

                                        return (
                                            <td key={schedule.id} className="px-2 py-3 whitespace-nowrap text-center border-gray-100 border-r">
                                                {subjectResult ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className={`font-medium ${isFail ? 'text-red-600' : 'text-gray-900'}`}>
                                                            {subjectResult.marks}
                                                        </span>
                                                        {/* <span className="text-[10px] text-gray-400">{subjectResult.grade}</span> */}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-300">-</span>
                                                )}
                                            </td>
                                        );
                                    })}

                                    {/* Aggregates */}
                                    <td className="px-4 py-3 whitespace-nowrap text-center font-bold text-gray-900 border-l border-gray-200 bg-gray-50/30">
                                        {data.totalObtained}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center font-semibold text-gray-700 bg-gray-50/30">
                                        {data.percentage}%
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center font-bold bg-gray-50/30">
                                        {data.failedSubjects > 0 ? (
                                            <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs">FAIL ({data.failedSubjects})</span>
                                        ) : (
                                            <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs">PASS</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan={subjectColumns.length + 5} className="text-center py-12 text-gray-500">
                                    No students found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExamReport;
