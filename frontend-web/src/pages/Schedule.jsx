// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { teachersAPI } from "../lib/api";
// import { useSelector } from "react-redux";
// import { selectCurrentUser } from "../store/slices/authSlice";

// const subjectColors = [
//   "border-red-400", "border-blue-400", "border-green-400",
//   "border-yellow-400", "border-purple-400", "border-pink-400",
// ];

// const getColor = (index) => subjectColors[index % subjectColors.length];

// const TeacherSchedule = () => {
//   const [schedule, setSchedule] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const currentUser = useSelector(selectCurrentUser);

//   const fetchSchedule = async () => {
//     if (!currentUser?.id) return;
//     try {
//       setLoading(true);
//       const res = await teachersAPI.getSchedule(currentUser.id);
//       setSchedule(res.data || []);
//     } catch (error) {
//       console.error("Failed to fetch schedule:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSchedule();
//   }, [currentUser]);

//   if (loading) return <div className="text-center mt-10 text-gray-600">Loading schedule...</div>;

//   const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//   const grouped = daysOfWeek.map(day => ({
//     day,
//     periods: schedule.filter(p => p.day_of_week.toLowerCase() === day.toLowerCase())
//   }));

//   return (
//     <div className="p-6">
//       <h2 className="text-3xl font-bold mb-6 text-gray-800">Weekly Schedule</h2>
//       {grouped.map(({ day, periods }) => (
//         <div key={day} className="mb-10">
//           <h3 className="text-2xl font-semibold mb-4 text-gray-700 border-b pb-2">{day}</h3>
//           {periods.length > 0 ? (
//             <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//               {periods.map((period, index) => (
//                 <Link
//                   to={`/schedule/${period.id}`}
//                   key={period.id}
//                   className={`p-5 border-l-8 ${getColor(index)} bg-white rounded-xl shadow hover:shadow-xl transition flex flex-col justify-between`}
//                 >
//                   <div>
//                     <p className="font-bold text-lg text-gray-800">{period.class_name}</p>
//                     <p className="text-gray-600 mt-1">{period.subject_name}</p>
//                     <p className="text-gray-500 text-sm mt-1">
//                       {period.start_time} - {period.end_time} | Room: {period.room_number || "N/A"}
//                     </p>
//                   </div>
//                   <span className="mt-3 text-blue-600 hover:underline text-sm font-medium">View Details →</span>
//                 </Link>
//               ))}
//             </div>
//           ) : (
//             <p className="text-gray-400 italic mt-2">No classes scheduled.</p>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default TeacherSchedule;
import { useEffect, useState } from "react";
import { teachersAPI, classesAPI, subjectsAPI } from "../lib/api";

const AdminTeacherScheduleForm = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({
    teacher_id: "",
    class_id: "",
    subject_id: "",
    day_of_week: "",
    start_time: "",
    end_time: "",
    room_number: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const t = await teachersAPI.getAll();
      const c = await classesAPI.getAll();
      const s = await subjectsAPI.getAll();
      setTeachers(t.data);
      setClasses(c.data);
      setSubjects(s.data);
    };
    fetchData();
  }, []);

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await teachersAPI.assignSchedule(form); // POST /teachers/schedule
      alert("Schedule created successfully!");
      setForm({ teacher_id: "", class_id: "", subject_id: "", day_of_week: "", start_time: "", end_time: "", room_number: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to create schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Add Teacher Schedule</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select name="teacher_id" value={form.teacher_id} onChange={handleChange} required>
          <option value="">Select Teacher</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        <select name="class_id" value={form.class_id} onChange={handleChange} required>
          <option value="">Select Class</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select name="subject_id" value={form.subject_id} onChange={handleChange} required>
          <option value="">Select Subject</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <select name="day_of_week" value={form.day_of_week} onChange={handleChange} required>
          <option value="">Select Day</option>
          {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <input type="time" name="start_time" value={form.start_time} onChange={handleChange} required />
        <input type="time" name="end_time" value={form.end_time} onChange={handleChange} required />
        <input type="text" name="room_number" value={form.room_number} onChange={handleChange} placeholder="Room Number (optional)" />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? "Saving..." : "Add Schedule"}
        </button>
      </form>
    </div>
  );
};

export default AdminTeacherScheduleForm;
