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
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "rooms"
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
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "my-room"
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
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to vacate"),
  });

  const deleteMutation = useMutation({
    mutationFn: hostelAPI.deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries(["hostel-rooms"]);
      toast.success("Room deleted successfully");
      setSelectedRoom(null);
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

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-80 bg-white border-r border-gray-200 p-4">
          <div className="animate-pulse space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Bed className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No rooms found</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-6 py-3 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-colors"
          >
            Add First Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar - Rooms List */}
        <div className="w-80 bg-white border-r border-gray-300 overflow-y-auto">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Hostel Rooms</h2>
                <p className="text-sm text-gray-600 mt-1">{rooms.length} Total Rooms</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="p-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                title="Add Room"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Hostels</option>
              <option value="male">Boys Hostel</option>
              <option value="female">Girls Hostel</option>
            </select>
          </div>

          <div className="p-4 space-y-2">
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => handleRoomClick(room)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${selectedRoom?.id === room.id
                  ? "bg-blue-50 border-blue-500 shadow-md"
                  : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedRoom?.id === room.id
                      ? "bg-blue-700"
                      : "bg-gray-100"
                      }`}>
                      <Bed className={`w-5 h-5 ${selectedRoom?.id === room.id
                        ? "text-white"
                        : "text-gray-600"
                        }`} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        Room {room.room_number}
                      </div>
                      <div className="text-xs text-gray-500">{room.building_name}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${room.type === "male"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                    }`}>
                    {room.type}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">
                    {room.current_occupancy}/{room.capacity}
                  </span>
                  <div className="flex-1 mx-2 bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${room.current_occupancy >= room.capacity
                        ? "bg-gray-700"
                        : "bg-blue-700"
                        }`}
                      style={{
                        width: `${(room.current_occupancy / room.capacity) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content - Room Details */}
        <div className="flex-1 overflow-y-auto">
          {selectedRoom ? (
            <RoomDetailsPanel
              room={selectedRoom}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAllocate={() => setShowAllocateModal(true)}
              onVacate={(allocationId) =>
                vacateMutation.mutate({ allocation_id: allocationId })
              }
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Bed className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Select a Room
                </h3>
                <p className="text-gray-500">
                  Choose a room from the sidebar to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddRoomModal onClose={handleCloseModal} initialData={editingRoom} />
      )}
      {showAllocateModal && selectedRoom && (
        <AllocateRoomModal
          room={selectedRoom}
          onClose={() => setShowAllocateModal(false)}
        />
      )}
    </>
  );
};

// Room Details Panel Component
const RoomDetailsPanel = ({ room, onEdit, onDelete, onAllocate, onVacate }) => {
  const { data: roomDetails, isLoading } = useQuery({
    queryKey: ["room-details", room.id],
    queryFn: () => hostelAPI.getRoomDetails(room.id).then((res) => res.data),
  });

  return (
    <div className="p-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-800 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Bed className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Room {room.room_number}</h1>
                <p className="text-blue-100 mt-1">{room.building_name}</p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${room.type === "male"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
              }`}>
              {room.type} Hostel
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 grid grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Capacity
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {room.capacity} Students
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Current Occupancy
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-700" />
              <span className={`text-lg font-semibold ${room.current_occupancy >= room.capacity
                ? "text-gray-700"
                : "text-blue-700"
                }`}>
                {room.current_occupancy} / {room.capacity}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Available Spots
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {room.capacity - room.current_occupancy}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Building
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {room.building_name}
            </div>
          </div>
        </div>

        {/* Occupants Table */}
        <div className="px-6 pb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Occupants ({roomDetails?.occupants?.length || 0})
          </h3>
          {isLoading ? (
            <p className="text-gray-500">Loading occupants...</p>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Admission No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Allocated Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {roomDetails?.occupants?.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        Room is empty
                      </td>
                    </tr>
                  ) : (
                    roomDetails?.occupants?.map((occ) => (
                      <tr key={occ.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {occ.first_name} {occ.last_name}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {occ.admission_number}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{occ.class_id}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(occ.allocation_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
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
                            className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium flex items-center ml-auto transition-colors"
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
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Actions
            </h3>
            <div className="flex items-center space-x-3">
              {room.current_occupancy < room.capacity && (
                <button
                  onClick={onAllocate}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Allocate Student</span>
                </button>
              )}

              <button
                onClick={() => onEdit(room)}
                className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors shadow-sm"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => onDelete(room.id)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
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
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Room {allocation.room_number}
            </h2>
            <p className="text-gray-700 font-medium">
              {allocation.building_name}
            </p>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-lg shadow-sm border border-blue-200">
            <span className="text-sm text-gray-500 block">Allocated Date</span>
            <span className="font-medium text-gray-900">
              {new Date(allocation.allocation_date).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Room Type</p>
            <p className="font-medium capitalize">{allocation.type} Hostel</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
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
              <p className="text-xs text-gray-500 mt-1">
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



export default HostelManagement;
