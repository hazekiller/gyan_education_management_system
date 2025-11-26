import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const TeacherScheduleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [period, setPeriod] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchPeriod = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/my-schedule/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: { _: Date.now() },
      });
      setPeriod(res.data?.data || null);
    } catch (err) {
      console.error("Schedule detail fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriod();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!period) return <div>Class not found.</div>;

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:underline">
        &larr; Back
      </button>
      <h2 className="text-2xl font-bold mb-2">{period.class_name}</h2>
      <p className="mb-1"><strong>Subject:</strong> {period.subject_name}</p>
      <p className="mb-1"><strong>Section:</strong> {period.section_name || "N/A"}</p>
      <p className="mb-1"><strong>Time:</strong> {period.start_time} - {period.end_time}</p>
      <p className="mb-1"><strong>Room:</strong> {period.room_number || "N/A"}</p>
      <p className="mb-1"><strong>Teacher:</strong> {period.teacher_name || "N/A"}</p>
      <p className="mt-2"><strong>Description:</strong> {period.description || "No additional info"}</p>
    </div>
  );
};

export default TeacherScheduleDetail;
