import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Home,
  Plus,
  Users,
  UserMinus,
  Bed,
  Building,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { hostelAPI, studentsAPI } from "../lib/api";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const HostelManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("rooms");
  const isAdmin = [
    "super_admin",
    "admin",
    "principal",
    "vice_principal",
  ].includes(user?.role);
  const isStudent = user?.role === "student";

  // If student, default to my-room
  if (isStudent && activeTab === "rooms") {
    setActiveTab("my-room");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hostel Management</h1>
        <p className="text-gray-600 mt-1">
          Manage hostel rooms and allocations
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {isAdmin && (
          <button
            onClick={() => setActiveTab("rooms")}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "rooms"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            }`}
          >
            <Building className="w-4 h-4 mr-2" />
            Rooms Management
          </button>
        )}
        {isStudent && (
          <button
            onClick={() => setActiveTab("my-room")}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "my-room"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            }`}
          >
            <Home className="w-4 h-4 mr-2" />
            My Room
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 min-h-[500px]">
        {activeTab === "rooms" && isAdmin && <RoomsTab />}
        {activeTab === "my-room" && <MyRoomTab />}
      </div>
    </div>
  );
};

// ==========================================
// ROOMS MANAGEMENT TAB (ADMIN)
// ==========================================
const RoomsTab = () => {
  const [filterType, setFilterType] = useState("all"); // all, male, female
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const queryClient = useQueryClient();

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["hostel-rooms", filterType],
    queryFn: () =>
      hostelAPI
        .getAllRooms({ type: filterType === "all" ? undefined : filterType })
        .then((res) => res.data || []),
  });

  const vacateMutation = useMutation({
    mutationFn: hostelAPI.vacateRoom,
    onSuccess: () => {
      queryClient.invalidateQueries(["hostel-rooms"]);
      queryClient.invalidateQueries(["room-details"]);
      toast.success("Student vacated successfully");
      setSelectedRoom(null); // Close details if open
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to vacate"),
  });

  const deleteMutation = useMutation({
    mutationFn: hostelAPI.deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries(["hostel-rooms"]);
      toast.success("Room deleted successfully");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to delete room"),
  });

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this room?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingRoom(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Hostels</option>
            <option value="male">Boys Hostel</option>
            <option value="female">Girls Hostel</option>
          </select>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p>Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-8">
            No rooms found.
          </p>
        ) : (
          rooms.map((room) => (
            <div
              key={room.id}
              className="border rounded-xl p-5 hover:shadow-lg transition-shadow bg-gray-50 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    Room {room.room_number}
                  </h3>
                  <p className="text-xs text-gray-500">{room.building_name}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    room.type === "male"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-pink-100 text-pink-700"
                  }`}
                >
                  {room.type}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-medium">{room.capacity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Occupied:</span>
                  <span
                    className={`font-medium ${
                      room.current_occupancy >= room.capacity
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {room.current_occupancy} / {room.capacity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      room.current_occupancy >= room.capacity
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${
                        (room.current_occupancy / room.capacity) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => handleEdit(room)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Room"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Room"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedRoom(room)}
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                >
                  View Details
                </button>
                {room.current_occupancy < room.capacity && (
                  <button
                    onClick={() => {
                      setSelectedRoom(room);
                      setShowAllocateModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    Allocate
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddRoomModal onClose={handleCloseModal} initialData={editingRoom} />
      )}
      {showAllocateModal && selectedRoom && (
        <AllocateRoomModal
          room={selectedRoom}
          onClose={() => {
            setShowAllocateModal(false);
            setSelectedRoom(null);
          }}
        />
      )}
      {selectedRoom && !showAllocateModal && (
        <RoomDetailsModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onVacate={(allocationId) =>
            vacateMutation.mutate({ allocation_id: allocationId })
          }
        />
      )}
    </div>
  );
};

// ==========================================
// MY ROOM TAB (STUDENT)
// ==========================================
const MyRoomTab = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["my-room"],
    queryFn: () => hostelAPI.getMyRoom().then((res) => res.data),
  });

  if (isLoading)
    return <p className="p-8 text-center">Loading room details...</p>;

  if (!data) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
        <Bed className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900">No Room Allocated</h3>
        <p className="text-gray-500 mt-2">
          You have not been allocated a hostel room yet.
        </p>
      </div>
    );
  }

  const { allocation, partners } = data;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Room {allocation.room_number}
            </h2>
            <p className="text-blue-600 font-medium">
              {allocation.building_name}
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
            <span className="text-sm text-gray-500 block">Allocated Date</span>
            <span className="font-medium">
              {new Date(allocation.allocation_date).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Room Type</p>
            <p className="font-medium capitalize">{allocation.type} Hostel</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Room Partners
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partners.length === 0 ? (
            <p className="text-gray-500 italic">No partners currently.</p>
          ) : (
            partners.map((partner, idx) => (
              <div
                key={idx}
                className="flex items-center p-4 bg-white border rounded-lg shadow-sm"
              >
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold mr-4">
                  {partner.first_name[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {partner.first_name} {partner.last_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Class {partner.class_id}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MODALS
// ==========================================

const AddRoomModal = ({ onClose, initialData }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    room_number: "",
    building_name: "Main Hostel",
    type: "male",
    capacity: 4,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        room_number: initialData.room_number,
        building_name: initialData.building_name,
        type: initialData.type,
        capacity: initialData.capacity,
      });
    }
  }, [initialData]);

  const mutation = useMutation({
    mutationFn: (data) =>
      initialData
        ? hostelAPI.updateRoom(initialData.id, data)
        : hostelAPI.createRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["hostel-rooms"]);
      toast.success(
        initialData ? "Room updated successfully" : "Room created successfully"
      );
      onClose();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to save room"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {initialData ? "Edit Room" : "Add New Room"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Room Number
            </label>
            <input
              required
              className="w-full border rounded px-3 py-2"
              value={formData.room_number}
              onChange={(e) =>
                setFormData({ ...formData, room_number: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Building Name
            </label>
            <input
              className="w-full border rounded px-3 py-2"
              value={formData.building_name}
              onChange={(e) =>
                setFormData({ ...formData, building_name: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Capacity</label>
              <input
                type="number"
                min="1"
                required
                className="w-full border rounded px-3 py-2"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {mutation.isPending
                ? "Saving..."
                : initialData
                ? "Update Room"
                : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AllocateRoomModal = ({ room, onClose }) => {
  const queryClient = useQueryClient();
  const [studentId, setStudentId] = useState("");

  // Fetch students
  const { data: students = [] } = useQuery({
    queryKey: ["students-list"],
    queryFn: () => studentsAPI.getAll().then((res) => res.data || []),
  });

  const mutation = useMutation({
    mutationFn: hostelAPI.allocateRoom,
    onSuccess: () => {
      queryClient.invalidateQueries(["hostel-rooms"]);
      toast.success("Room allocated successfully");
      onClose();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to allocate"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ student_id: studentId, room_id: room.id });
  };

  // Filter students by gender matching room type (if gender is available in student object)
  // Assuming student object has 'gender' field as seen in DB schema
  const filteredStudents = students.filter((s) => s.gender === room.type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-2">
          Allocate Room {room.room_number}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Type: {room.type} | Available Spots:{" "}
          {room.capacity - room.current_occupancy}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Student
            </label>
            <select
              required
              className="w-full border rounded px-3 py-2"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">-- Select Student --</option>
              {filteredStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name} ({s.admission_number})
                </option>
              ))}
            </select>
            {filteredStudents.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                No students of matching gender found.
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !studentId}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {mutation.isPending ? "Allocating..." : "Allocate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RoomDetailsModal = ({ room, onClose, onVacate }) => {
  const { data: roomDetails, isLoading } = useQuery({
    queryKey: ["room-details", room.id],
    queryFn: () => hostelAPI.getRoomDetails(room.id).then((res) => res.data),
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              Room {room.room_number} Details
            </h2>
            <p className="text-gray-500">
              {room.building_name} ({room.type})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        {isLoading ? (
          <p>Loading details...</p>
        ) : (
          <div>
            <h3 className="font-bold text-lg mb-3">
              Occupants ({roomDetails?.occupants?.length || 0}/{room.capacity})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-sm font-medium text-gray-600">
                      Name
                    </th>
                    <th className="p-3 text-sm font-medium text-gray-600">
                      Admission No
                    </th>
                    <th className="p-3 text-sm font-medium text-gray-600">
                      Class
                    </th>
                    <th className="p-3 text-sm font-medium text-gray-600">
                      Allocated Date
                    </th>
                    <th className="p-3 text-sm font-medium text-gray-600 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {roomDetails?.occupants?.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-gray-500">
                        Room is empty
                      </td>
                    </tr>
                  ) : (
                    roomDetails?.occupants?.map((occ) => (
                      <tr key={occ.id}>
                        <td className="p-3 font-medium">
                          {occ.first_name} {occ.last_name}
                        </td>
                        <td className="p-3 text-gray-600">
                          {occ.admission_number}
                        </td>
                        <td className="p-3 text-gray-600">{occ.class_id}</td>
                        <td className="p-3 text-gray-600">
                          {new Date(occ.allocation_date).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to vacate this student?"
                                )
                              ) {
                                onVacate(occ.allocation_id);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center justify-end ml-auto"
                          >
                            <UserMinus className="w-4 h-4 mr-1" />
                            Vacate
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostelManagement;
