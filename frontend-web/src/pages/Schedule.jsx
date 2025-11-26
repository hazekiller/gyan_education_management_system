import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../store/slices/authSlice";

const TeacherSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  const currentUser = useSelector(selectCurrentUser); // ✅ get current user from Redux

  const fetchSchedule = async () => {
    try {
      setLoading(true);

      if (!currentUser?.id) return; // safety check

      const res = await axios.get(`${API_URL}/teachers/${currentUser.id}/schedule`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: { _: Date.now() },
      });
      setSchedule(res.data?.data || []);
    } catch (err) {
      console.error("Schedule fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [currentUser]);

  if (loading) return <div>Loading...</div>;

  // Group schedule by day
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const grouped = days.map(day => ({
    day,
    periods: schedule.filter(p => p.day_of_week.toLowerCase() === day.toLowerCase())
  }));

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Weekly Schedule</h2>
      {grouped.map((day) => (
        <div key={day.day} className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{day.day}</h3>
          {day.periods.length > 0 ? (
            <ul className="space-y-2">
              {day.periods.map((period) => (
                <li key={period.id} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <p><strong>{period.class_name}</strong> - {period.subject_name}</p>
                    <p>{period.start_time} - {period.end_time} | Room {period.room_number}</p>
                  </div>
                  <Link
                    to={`/schedule/${period.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View Detail
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No classes.</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default TeacherSchedule;

