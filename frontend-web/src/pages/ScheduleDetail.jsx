import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { teachersAPI } from "../lib/api";
import { FaChalkboardTeacher, FaClock, FaDoorOpen, FaBook } from "react-icons/fa";

const TeacherScheduleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [period, setPeriod] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPeriod = async () => {
    try {
      setLoading(true);
      const res = await teachersAPI.getScheduleDetail(id);
      setPeriod(res.data || null);
    } catch (error) {
      console.error("Failed to fetch schedule detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriod();
  }, [id]);

  if (loading) return <div className="text-center mt-10 text-gray-600">Loading details...</div>;
  if (!period) return <div className="text-center mt-10 text-gray-500">Period not found.</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
      >
        &larr; Back
      </button>

      <div className="p-6 bg-white border rounded-2xl shadow-lg hover:shadow-2xl transition">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">{period.class_name}</h2>

        <div className="grid gap-3">
          <p className="flex items-center gap-2 text-gray-700">
            <FaBook className="text-blue-500" /> <strong>Subject:</strong> {period.subject_name}
          </p>
          <p className="flex items-center gap-2 text-gray-700">
            <FaChalkboardTeacher className="text-green-500" /> <strong>Teacher:</strong> {period.teacher_name || "N/A"}
          </p>
          <p className="flex items-center gap-2 text-gray-700">
            <FaClock className="text-purple-500" /> <strong>Time:</strong> {period.start_time} - {period.end_time}
          </p>
          <p className="flex items-center gap-2 text-gray-700">
            <FaDoorOpen className="text-yellow-500" /> <strong>Room:</strong> {period.room_number || "N/A"}
          </p>
          <p className="text-gray-600">
            <strong>Section:</strong> {period.section_name || "N/A"}
          </p>
        </div>

        {period.description && (
          <p className="mt-4 text-gray-700 border-t pt-3">
            <strong>Description:</strong> {period.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default TeacherScheduleDetail;
