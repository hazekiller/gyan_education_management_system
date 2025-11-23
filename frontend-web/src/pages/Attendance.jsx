// File: frontend-web/src/pages/Attendance.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Check, X, Clock } from 'lucide-react';
import { attendanceAPI, classesAPI, studentsAPI } from '../lib/api';
import toast from 'react-hot-toast';

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [attendanceData, setAttendanceData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch classes
  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: classesAPI.getAll
  });

  const classes = classesData?.data || [];

  // Fetch sections when class is selected
  const { data: sectionsData } = useQuery({
    queryKey: ['sections', selectedClass],
    queryFn: () => classesAPI.getSections(selectedClass),
    enabled: !!selectedClass
  });

  const sections = sectionsData?.data || [];

  // Fetch students when class and section are selected
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['students', selectedClass, selectedSection],
    queryFn: () => studentsAPI.getAll({ 
      class_id: selectedClass, 
      section_id: selectedSection,
      status: 'active'
    }),
    enabled: !!selectedClass && !!selectedSection
  });

  const students = studentsData?.data || [];

  // Fetch existing attendance
  const { data: existingAttendance } = useQuery({
    queryKey: ['attendance', selectedClass, selectedSection, selectedDate],
    queryFn: () => attendanceAPI.get({
      class_id: selectedClass,
      section_id: selectedSection,
      date: selectedDate
    }),
    enabled: !!selectedClass && !!selectedSection && !!selectedDate
  });

  // Initialize attendance data when students or existing attendance changes
  useState(() => {
    if (students.length > 0) {
      const newAttendanceData = {};
      
      students.forEach(student => {
        const existing = existingAttendance?.data?.find(
          a => a.student_id === student.id
        );
        newAttendanceData[student.id] = existing?.status || 'present';
      });
      
      setAttendanceData(newAttendanceData);
    }
  }, [students, existingAttendance]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData({
      ...attendanceData,
      [studentId]: status
    });
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedSection) {
      toast.error('Please select class and section');
      return;
    }

    const attendanceRecords = Object.entries(attendanceData).map(
      ([studentId, status]) => ({
        student_id: parseInt(studentId),
        class_id: parseInt(selectedClass),
        section_id: parseInt(selectedSection),
        date: selectedDate,
        status,
        remarks: ''
      })
    );

    setSubmitting(true);
    try {
      await attendanceAPI.mark({ attendanceRecords });
      toast.success('Attendance marked successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusCounts = () => {
    const counts = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0
    };

    Object.values(attendanceData).forEach(status => {
      if (counts.hasOwnProperty(status)) {
        counts[status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
        <p className="text-gray-600 mt-1">Mark and manage student attendance</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input"
            />
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection('');
              }}
              className="input"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div> */}

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="input"
              disabled={!selectedClass}
            >
              <option value="">Select Section</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div> */}

          <div className="flex items-end">
            <button
              onClick={handleSubmit}
              disabled={submitting || students.length === 0}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'view Attendance'}
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {students.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-600">
                  {statusCounts.present}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">
                  {statusCounts.absent}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <X className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Late</p>
                <p className="text-2xl font-bold text-orange-600">
                  {statusCounts.late}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Excused</p>
                <p className="text-2xl font-bold text-blue-600">
                  {statusCounts.excused}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Students List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {!selectedClass || !selectedSection ? (
          <div className="p-12 text-center text-gray-500">
            Please select class and section to view students
          </div>
        ) : studentsLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loading"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No students found in this class
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Roll No.</th>
                  <th>Student Name</th>
                  <th>Admission No.</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="font-medium">{student.roll_number}</td>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {student.first_name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium">
                          {student.first_name} {student.last_name}
                        </span>
                      </div>
                    </td>
                    <td>{student.admission_number}</td>
                    <td>
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleAttendanceChange(student.id, 'present')}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            attendanceData[student.id] === 'present'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(student.id, 'absent')}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            attendanceData[student.id] === 'absent'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(student.id, 'late')}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            attendanceData[student.id] === 'late'
                              ? 'bg-orange-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(student.id, 'excused')}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            attendanceData[student.id] === 'excused'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Excused
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;