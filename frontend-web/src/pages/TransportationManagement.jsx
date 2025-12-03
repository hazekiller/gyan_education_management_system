import { useState,useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bus,
  MapPin,
  Users,
  Plus,
  Trash2,
  Navigation,
  UserCheck,
  Edit,
  X,
} from "lucide-react";
import { transportAPI, studentsAPI } from "../lib/api";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const TransportationManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("vehicles");
  const isAdmin = ["super_admin", "admin", "principal"].includes(user?.role);
  const isStudent = user?.role === "student";

  // If student, default to my-transport
  if (isStudent && activeTab === "vehicles") {
    setActiveTab("my-transport");
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Bus className="w-10 h-10" />
          <h1 className="text-4xl font-bold">Transportation Management</h1>
        </div>
        <p className="text-blue-100 text-lg">
          Manage buses, routes, and student allocations
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-white border border-gray-200 p-1.5 rounded-xl shadow-sm overflow-x-auto">
        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab("vehicles")}
              className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === "vehicles"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transform scale-105"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Bus className="w-4 h-4 mr-2" />
              Vehicles
            </button>
            <button
              onClick={() => setActiveTab("routes")}
              className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === "routes"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transform scale-105"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Routes
            </button>
            <button
              onClick={() => setActiveTab("allocations")}
              className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === "allocations"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transform scale-105"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Allocations
            </button>
          </>
        )}
        {isStudent && (
          <button
            onClick={() => setActiveTab("my-transport")}
            className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === "my-transport"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transform scale-105"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Bus className="w-4 h-4 mr-2" />
            My Transport
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 min-h-[500px]">
        {activeTab === "vehicles" && isAdmin && <VehiclesTab />}
        {activeTab === "routes" && isAdmin && <RoutesTab />}
        {activeTab === "allocations" && isAdmin && <AllocationsTab />}
        {activeTab === "my-transport" && <MyTransportTab />}
      </div>
    </div>
  );
};

// ==========================================
// VEHICLES TAB
// ==========================================
const VehiclesTab = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const queryClient = useQueryClient();

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["transport-vehicles"],
    queryFn: () => transportAPI.getAllVehicles().then((res) => res.data || []),
  });

  const deleteMutation = useMutation({
    mutationFn: transportAPI.deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries(["transport-vehicles"]);
      toast.success("Vehicle deleted");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to delete"),
  });

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVehicle(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Bus className="w-8 h-8 text-blue-600" />
          Bus Fleet
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all font-medium"
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Loading vehicles...
          </div>
        ) : (
          vehicles.map((v) => (
            <div
              key={v.id}
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-2xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Status Badge */}
              <span
                className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg ${
                  v.status === "active"
                    ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-200"
                    : "bg-red-100 text-red-800 border-2 border-red-200"
                }`}
              >
                {v.status}
              </span>

              <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(v)}
                  className="p-2 bg-white/90 rounded-full text-blue-600 hover:bg-blue-50 shadow-sm"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="p-2 bg-white/90 rounded-full text-red-600 hover:bg-red-50 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Bus Info */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h3 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                  {v.bus_number}
                </h3>
                <p className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded-full inline-block">
                  {v.registration_number}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                  <span className="text-gray-600 font-medium">Driver</span>
                  <span className="font-semibold text-gray-900">
                    {v.driver_name}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                  <span className="text-gray-600 font-medium">Phone</span>
                  <span className="font-semibold text-blue-600">
                    {v.driver_phone}
                  </span>
                </div>
                {v.sub_driver_name && (
                  <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <span className="text-amber-700 font-medium">
                      Sub-Driver
                    </span>
                    <span className="font-semibold text-gray-900">
                      {v.sub_driver_name}
                    </span>
                  </div>
                )}
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                  <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wide block mb-2">
                    Capacity
                  </span>
                  <span className="text-2xl font-bold text-emerald-800">
                    {v.capacity}
                  </span>
                  <span className="text-sm text-emerald-700"> seats</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {showModal && (
        <AddVehicleModal
          onClose={handleCloseModal}
          initialData={editingVehicle}
        />
      )}
    </div>
  );
};

// ==========================================
// ROUTES TAB
// ==========================================
const RoutesTab = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const queryClient = useQueryClient();

  const { data: routes = [], isLoading } = useQuery({
    queryKey: ["transport-routes"],
    queryFn: () => transportAPI.getAllRoutes().then((res) => res.data || []),
  });

  const deleteMutation = useMutation({
    mutationFn: transportAPI.deleteRoute,
    onSuccess: () => {
      queryClient.invalidateQueries(["transport-routes"]);
      toast.success("Route deleted");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to delete"),
  });

  const handleEdit = (route) => {
    setEditingRoute(route);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this route?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRoute(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-100">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Navigation className="w-8 h-8 text-emerald-600" />
          Route Network
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all font-medium"
        >
          <Plus className="w-4 h-4" /> Create Route
        </button>
      </div>

      {/* Routes List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white rounded-2xl p-6 shadow-md border border-gray-100 h-80"
              ></div>
            ))}
          </div>
        ) : (
          routes.map((r) => (
            <div
              key={r.id}
              className="group bg-white rounded-2xl p-6 hover:shadow-xl hover:border-emerald-200 border border-gray-100 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Route Header */}
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-emerald-700 mb-2 group-hover:text-emerald-800 transition-colors">
                    {r.route_name}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Bus className="w-4 h-4" />
                    {r.bus_number || "Unassigned"}
                    {r.driver_name && `(${r.driver_name})`}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-lg text-gray-900 flex items-center gap-2 mb-1">
                    {r.start_point}
                    <span className="text-emerald-600 font-bold text-xl">
                      ➝
                    </span>
                    {r.end_point}
                  </p>
                  <p className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {r.stops?.length || 0} Stops
                  </p>
                  <div className="flex gap-2 justify-end mt-2">
                    <button
                      onClick={() => handleEdit(r)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Enhanced Stops Visualization */}
              <div className="relative bg-gradient-to-r from-slate-50 to-emerald-50 rounded-2xl p-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5"></div>
                <div className="relative flex items-center justify-between px-6">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-gray-200 via-emerald-300 to-teal-300 -z-10 transform -translate-y-1/2 rounded-full shadow-lg"></div>
                  {r.stops?.map((stop, idx) => (
                    <div
                      key={stop.id}
                      className="flex flex-col items-center z-10 bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-white/50 group-hover:scale-105 transition-all"
                    >
                      <div
                        className={`w-5 h-5 rounded-2xl flex items-center justify-center mb-2 shadow-lg transition-all ${
                          idx === 0
                            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/50"
                            : idx === r.stops.length - 1
                            ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-orange-500/50"
                            : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-500/50"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span className="text-xs font-bold text-gray-900 text-center leading-tight min-w-[60px] px-1">
                        {stop.stop_name}
                      </span>
                      <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full mt-1">
                        {stop.pickup_time?.slice(0, 5)}
                      </span>
                    </div>
                  )) || (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No stops assigned
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {showModal && (
        <AddRouteModal onClose={handleCloseModal} initialData={editingRoute} />
      )}
    </div>
  );
};

// ==========================================
// ALLOCATIONS TAB
// ==========================================
const AllocationsTab = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState(null);
  const queryClient = useQueryClient();

  const { data: allocations = [], isLoading } = useQuery({
    queryKey: ["transport-allocations"],
    queryFn: () =>
      transportAPI.getAllAllocations().then((res) => res.data || []),
  });

  const cancelMutation = useMutation({
    mutationFn: transportAPI.cancelAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries(["transport-allocations"]);
      toast.success("Allocation cancelled");
    },
  });

  const handleEdit = (allocation) => {
    setEditingAllocation(allocation);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAllocation(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Users className="w-8 h-8 text-purple-600" />
          Student Allocations
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all font-medium"
        >
          <Plus className="w-4 h-4" /> Allocate Student
        </button>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Route / Bus
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Pickup / Drop
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Seat
                </th>
                <th className="px-6 py-5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-gradient-to-b from-white to-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <div className="flex items-center justify-center gap-3 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      <span>Loading allocations...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                allocations.map((a) => (
                  <tr
                    key={a.id}
                    className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-b border-gray-50"
                  >
                    {/* Student */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                            {a.first_name} {a.last_name}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <span>Class {a.class_id}</span>
                            <span>•</span>
                            <span>{a.admission_number}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Route/Bus */}
                    <td className="px-6 py-5">
                      <div className="font-semibold text-gray-900">
                        {a.route_name}
                      </div>
                      <div className="text-sm font-mono bg-blue-100 text-blue-800 px-3 py-1 rounded-full mt-1 inline-block">
                        {a.bus_number}
                      </div>
                    </td>

                    {/* Pickup/Drop */}
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                          <span className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></span>
                          ↑ {a.pickup_point}
                        </div>
                        <div className="flex items-center gap-2 text-red-700 font-medium text-sm">
                          <span className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></span>
                          ↓ {a.drop_point}
                        </div>
                      </div>
                    </td>

                    {/* Seat */}
                    <td className="px-6 py-5">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                        <span className="font-bold text-xl text-white font-mono">
                          {a.seat_number || "-"}
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => handleEdit(a)}
                        className="group relative p-3 mr-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:scale-105 transition-all duration-200 hover:-translate-y-0.5"
                      >
                        <Edit className="w-5 h-5" />
                        <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-blue-900 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
                          Edit
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Cancel allocation?"))
                            cancelMutation.mutate(a.id);
                        }}
                        className="group relative p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl shadow-lg hover:from-red-600 hover:to-red-700 hover:shadow-xl hover:scale-105 transition-all duration-200 hover:-translate-y-0.5"
                      >
                        <Trash2 className="w-5 h-5" />
                        <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-red-900 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
                          Cancel
                        </span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <AllocateTransportModal
          onClose={handleCloseModal}
          initialData={editingAllocation}
        />
      )}
    </div>
  );
};

// ==========================================
// MY TRANSPORT TAB (STUDENT)
// ==========================================
const MyTransportTab = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["my-transport"],
    queryFn: () => transportAPI.getMyTransport().then((res) => res.data),
  });

  if (isLoading)
    return <p className="p-8 text-center">Loading transport details...</p>;

  if (!data) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
        <Bus className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900">
          No Transport Allocated
        </h3>
        <p className="text-gray-500 mt-2">
          You are not subscribed to school transport.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {data.route_name}
            </h2>
            <p className="text-yellow-700 font-medium">
              {data.bus_number} ({data.registration_number})
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-center">
            <span className="text-sm text-gray-500 block">Seat Number</span>
            <span className="text-2xl font-bold text-blue-600">
              {data.seat_number || "N/A"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">
              Pickup Point
            </p>
            <p className="font-bold text-lg">{data.pickup_name}</p>
            <p className="text-sm text-gray-600">
              Time: {data.pickup_time?.slice(0, 5)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">
              Drop Point
            </p>
            <p className="font-bold text-lg">{data.drop_name}</p>
            <p className="text-sm text-gray-600">
              Time: {data.drop_time?.slice(0, 5)}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-bold text-gray-800 mb-3 flex items-center">
            <UserCheck className="w-4 h-4 mr-2" /> Driver Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Driver</p>
              <p className="font-medium">{data.driver_name}</p>
              <p className="text-sm text-blue-600">{data.driver_phone}</p>
            </div>
            {data.sub_driver_name && (
              <div>
                <p className="text-sm text-gray-500">Sub-Driver</p>
                <p className="font-medium">{data.sub_driver_name}</p>
                <p className="text-sm text-blue-600">{data.sub_driver_phone}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MODALS
// ==========================================

const AddVehicleModal = ({ onClose, initialData }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    bus_number: "",
    registration_number: "",
    driver_name: "",
    driver_phone: "",
    sub_driver_name: "",
    sub_driver_phone: "",
    capacity: 40,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        bus_number: initialData.bus_number,
        registration_number: initialData.registration_number,
        driver_name: initialData.driver_name,
        driver_phone: initialData.driver_phone,
        sub_driver_name: initialData.sub_driver_name || "",
        sub_driver_phone: initialData.sub_driver_phone || "",
        capacity: initialData.capacity,
      });
    }
  }, [initialData]);

  const mutation = useMutation({
    mutationFn: (data) =>
      initialData
        ? transportAPI.updateVehicle(initialData.id, data)
        : transportAPI.createVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["transport-vehicles"]);
      toast.success(initialData ? "Vehicle updated" : "Vehicle added");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit Vehicle" : "Add New Vehicle"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              required
              placeholder="Bus Number (e.g. Bus-01)"
              className="border rounded px-3 py-2"
              value={formData.bus_number}
              onChange={(e) =>
                setFormData({ ...formData, bus_number: e.target.value })
              }
            />
            <input
              required
              placeholder="Registration No."
              className="border rounded px-3 py-2"
              value={formData.registration_number}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  registration_number: e.target.value,
                })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              required
              placeholder="Driver Name"
              className="border rounded px-3 py-2"
              value={formData.driver_name}
              onChange={(e) =>
                setFormData({ ...formData, driver_name: e.target.value })
              }
            />
            <input
              required
              placeholder="Driver Phone"
              className="border rounded px-3 py-2"
              value={formData.driver_phone}
              onChange={(e) =>
                setFormData({ ...formData, driver_phone: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Sub-Driver Name"
              className="border rounded px-3 py-2"
              value={formData.sub_driver_name}
              onChange={(e) =>
                setFormData({ ...formData, sub_driver_name: e.target.value })
              }
            />
            <input
              placeholder="Sub-Driver Phone"
              className="border rounded px-3 py-2"
              value={formData.sub_driver_phone}
              onChange={(e) =>
                setFormData({ ...formData, sub_driver_phone: e.target.value })
              }
            />
          </div>
          <input
            type="number"
            placeholder="Capacity"
            className="w-full border rounded px-3 py-2"
            value={formData.capacity}
            onChange={(e) =>
              setFormData({ ...formData, capacity: e.target.value })
            }
          />

          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {initialData ? "Update Vehicle" : "Add Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddRouteModal = ({ onClose, initialData }) => {
  const queryClient = useQueryClient();
  const [stops, setStops] = useState([
    { stop_name: "", pickup_time: "", drop_time: "", fare: 0 },
  ]);
  const [formData, setFormData] = useState({
    route_name: "",
    vehicle_id: "",
    start_point: "",
    end_point: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        route_name: initialData.route_name,
        vehicle_id: initialData.vehicle_id || "",
        start_point: initialData.start_point,
        end_point: initialData.end_point,
      });
      if (initialData.stops && initialData.stops.length > 0) {
        setStops(
          initialData.stops.map((s) => ({
            stop_name: s.stop_name,
            pickup_time: s.pickup_time,
            drop_time: s.drop_time,
            fare: s.fare,
          }))
        );
      }
    }
  }, [initialData]);

  const { data: vehicles = [] } = useQuery({
    queryKey: ["transport-vehicles"],
    queryFn: () => transportAPI.getAllVehicles().then((res) => res.data || []),
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      initialData
        ? transportAPI.updateRoute(initialData.id, data)
        : transportAPI.createRoute(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["transport-routes"]);
      toast.success(initialData ? "Route updated" : "Route created");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const addStop = () =>
    setStops([
      ...stops,
      { stop_name: "", pickup_time: "", drop_time: "", fare: 0 },
    ]);
  const updateStop = (idx, field, val) => {
    const newStops = [...stops];
    newStops[idx][field] = val;
    setStops(newStops);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ ...formData, stops });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit Route" : "Create New Route"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              required
              placeholder="Route Name"
              className="border rounded px-3 py-2"
              value={formData.route_name}
              onChange={(e) =>
                setFormData({ ...formData, route_name: e.target.value })
              }
            />
            <select
              className="border rounded px-3 py-2"
              value={formData.vehicle_id}
              onChange={(e) =>
                setFormData({ ...formData, vehicle_id: e.target.value })
              }
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.bus_number}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              required
              placeholder="Start Point"
              className="border rounded px-3 py-2"
              value={formData.start_point}
              onChange={(e) =>
                setFormData({ ...formData, start_point: e.target.value })
              }
            />
            <input
              required
              placeholder="End Point"
              className="border rounded px-3 py-2"
              value={formData.end_point}
              onChange={(e) =>
                setFormData({ ...formData, end_point: e.target.value })
              }
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-bold mb-2">Stops</h4>
            {stops.map((stop, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-2 mb-2">
                <input
                  placeholder="Stop Name"
                  className="border rounded px-2 py-1 text-sm"
                  value={stop.stop_name}
                  onChange={(e) => updateStop(idx, "stop_name", e.target.value)}
                  required
                />
                <input
                  type="time"
                  className="border rounded px-2 py-1 text-sm"
                  value={stop.pickup_time}
                  onChange={(e) =>
                    updateStop(idx, "pickup_time", e.target.value)
                  }
                  required
                />
                <input
                  type="time"
                  className="border rounded px-2 py-1 text-sm"
                  value={stop.drop_time}
                  onChange={(e) => updateStop(idx, "drop_time", e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Fare"
                  className="border rounded px-2 py-1 text-sm"
                  value={stop.fare}
                  onChange={(e) => updateStop(idx, "fare", e.target.value)}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addStop}
              className="text-blue-600 text-sm hover:underline"
            >
              + Add Stop
            </button>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {initialData ? "Update Route" : "Create Route"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AllocateTransportModal = ({ onClose, initialData }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    student_id: "",
    route_id: "",
    pickup_stop_id: "",
    drop_stop_id: "",
    seat_number: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        student_id: initialData.student_id,
        route_id: initialData.route_id,
        pickup_stop_id: initialData.pickup_stop_id,
        drop_stop_id: initialData.drop_stop_id,
        seat_number: initialData.seat_number || "",
      });
    }
  }, [initialData]);

  const { data: students = [] } = useQuery({
    queryKey: ["students-list"],
    queryFn: () => studentsAPI.getAll().then((res) => res.data || []),
  });
  const { data: routes = [] } = useQuery({
    queryKey: ["transport-routes"],
    queryFn: () => transportAPI.getAllRoutes().then((res) => res.data || []),
  });

  const selectedRoute = routes.find((r) => r.id == formData.route_id);

  const mutation = useMutation({
    mutationFn: (data) =>
      initialData
        ? transportAPI.updateAllocation(initialData.id, data)
        : transportAPI.allocateTransport(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["transport-allocations"]);
      toast.success(initialData ? "Allocation updated" : "Allocated");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit Allocation" : "Allocate Transport"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            required
            disabled={!!initialData}
            className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
            value={formData.student_id}
            onChange={(e) =>
              setFormData({ ...formData, student_id: e.target.value })
            }
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.first_name} {s.last_name} ({s.admission_number})
              </option>
            ))}
          </select>

          <select
            required
            className="w-full border rounded px-3 py-2"
            value={formData.route_id}
            onChange={(e) =>
              setFormData({ ...formData, route_id: e.target.value })
            }
          >
            <option value="">Select Route</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.route_name}
              </option>
            ))}
          </select>

          {selectedRoute && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <select
                  required
                  className="border rounded px-3 py-2"
                  value={formData.pickup_stop_id}
                  onChange={(e) =>
                    setFormData({ ...formData, pickup_stop_id: e.target.value })
                  }
                >
                  <option value="">Pickup Point</option>
                  {selectedRoute.stops?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.stop_name}
                    </option>
                  ))}
                </select>
                <select
                  required
                  className="border rounded px-3 py-2"
                  value={formData.drop_stop_id}
                  onChange={(e) =>
                    setFormData({ ...formData, drop_stop_id: e.target.value })
                  }
                >
                  <option value="">Drop Point</option>
                  {selectedRoute.stops?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.stop_name}
                    </option>
                  ))}
                </select>
              </div>
              <input
                placeholder="Seat Number (Optional)"
                className="w-full border rounded px-3 py-2"
                value={formData.seat_number}
                onChange={(e) =>
                  setFormData({ ...formData, seat_number: e.target.value })
                }
              />
            </>
          )}

          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {initialData ? "Update" : "Allocate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransportationManagement;
