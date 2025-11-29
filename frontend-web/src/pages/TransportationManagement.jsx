import { useState, useEffect } from "react";
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
} from "lucide-react";
import { transportAPI, studentsAPI } from "../lib/api";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import Modal from "../components/common/Modal";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Transportation Management
        </h1>
        <p className="text-gray-600 mt-1">
          Manage buses, routes, and student allocations
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit overflow-x-auto">
        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab("vehicles")}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "vehicles"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Bus className="w-4 h-4 mr-2" />
              Vehicles
            </button>
            <button
              onClick={() => setActiveTab("routes")}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "routes"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Routes
            </button>
            <button
              onClick={() => setActiveTab("allocations")}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "allocations"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:bg-gray-200"
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
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "my-transport"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Bus className="w-4 h-4 mr-2" />
            My Transport
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 min-h-[500px]">
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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Bus Fleet</h3>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          vehicles.map((v) => (
            <div
              key={v.id}
              className="border rounded-xl p-5 hover:shadow-lg transition-shadow bg-gray-50"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    {v.bus_number}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {v.registration_number}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    v.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {v.status}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Driver:</span>{" "}
                  <span className="font-medium">{v.driver_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>{" "}
                  <span className="font-medium">{v.driver_phone}</span>
                </div>
                {v.sub_driver_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sub-Driver:</span>{" "}
                    <span className="font-medium">{v.sub_driver_name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacity:</span>{" "}
                  <span className="font-medium">{v.capacity} Seats</span>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => handleEdit(v)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
      >
        <VehicleForm
          onClose={handleCloseModal}
          vehicleToEdit={editingVehicle}
        />
      </Modal>
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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Route Network</h3>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Route
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          routes.map((r) => (
            <div
              key={r.id}
              className="border rounded-xl p-5 bg-white hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-blue-700">
                    {r.route_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Vehicle: {r.bus_number || "Unassigned"} (
                    {r.driver_name || "No Driver"})
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">
                    {r.start_point} ➝ {r.end_point}
                  </p>
                  <p className="text-gray-500">{r.stops?.length || 0} Stops</p>
                </div>
              </div>

              {/* Stops Visualization */}
              <div className="relative flex items-center justify-between mt-6 px-4">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10"></div>
                {r.stops?.map((stop, idx) => (
                  <div
                    key={stop.id}
                    className="flex flex-col items-center bg-white p-1"
                  >
                    <div className="w-3 h-3 rounded-full bg-blue-500 mb-1"></div>
                    <span className="text-xs font-medium text-gray-700">
                      {stop.stop_name}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {stop.pickup_time?.slice(0, 5)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => handleEdit(r)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingRoute ? "Edit Route" : "Create New Route"}
        size="lg"
      >
        <RouteForm onClose={handleCloseModal} routeToEdit={editingRoute} />
      </Modal>
    </div>
  );
};

// ==========================================
// ALLOCATIONS TAB
// ==========================================
const AllocationsTab = () => {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: allocations = [], isLoading } = useQuery({
    queryKey: ["transport-allocations"],
    queryFn: () => transportAPI.getAllocations().then((res) => res.data || []),
  });

  const cancelMutation = useMutation({
    mutationFn: transportAPI.cancelAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries(["transport-allocations"]);
      toast.success("Allocation cancelled");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Student Allocations</h3>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Allocate Student
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-sm font-medium text-gray-600">Student</th>
              <th className="p-3 text-sm font-medium text-gray-600">
                Route / Bus
              </th>
              <th className="p-3 text-sm font-medium text-gray-600">
                Pickup / Drop
              </th>
              <th className="p-3 text-sm font-medium text-gray-600">Seat No</th>
              <th className="p-3 text-sm font-medium text-gray-600 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : (
              allocations.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium">
                      {a.first_name} {a.last_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Class {a.class_id} ({a.admission_number})
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{a.route_name}</div>
                    <div className="text-xs text-blue-600">{a.bus_number}</div>
                  </td>
                  <td className="p-3 text-sm">
                    <div className="flex items-center">
                      <span className="text-green-600 mr-1">↑</span>{" "}
                      {a.pickup_point}
                    </div>
                    <div className="flex items-center">
                      <span className="text-red-600 mr-1">↓</span>{" "}
                      {a.drop_point}
                    </div>
                  </td>
                  <td className="p-3 font-mono font-bold text-gray-700">
                    {a.seat_number || "-"}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm("Cancel allocation?"))
                          cancelMutation.mutate(a.id);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Allocate Transport"
      >
        <AllocationForm onClose={() => setShowModal(false)} />
      </Modal>
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
// FORMS
// ==========================================

const VehicleForm = ({ onClose, vehicleToEdit }) => {
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
    if (vehicleToEdit) {
      setFormData({
        bus_number: vehicleToEdit.bus_number,
        registration_number: vehicleToEdit.registration_number,
        driver_name: vehicleToEdit.driver_name,
        driver_phone: vehicleToEdit.driver_phone,
        sub_driver_name: vehicleToEdit.sub_driver_name || "",
        sub_driver_phone: vehicleToEdit.sub_driver_phone || "",
        capacity: vehicleToEdit.capacity,
      });
    }
  }, [vehicleToEdit]);

  const mutation = useMutation({
    mutationFn: (data) =>
      vehicleToEdit
        ? transportAPI.updateVehicle(vehicleToEdit.id, data)
        : transportAPI.createVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["transport-vehicles"]);
      toast.success(vehicleToEdit ? "Vehicle updated" : "Vehicle added");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
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
        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
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
          {vehicleToEdit ? "Update Vehicle" : "Add Vehicle"}
        </button>
      </div>
    </form>
  );
};

const RouteForm = ({ onClose, routeToEdit }) => {
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

  const { data: vehicles = [] } = useQuery({
    queryKey: ["transport-vehicles"],
    queryFn: () => transportAPI.getAllVehicles().then((res) => res.data || []),
  });

  useEffect(() => {
    if (routeToEdit) {
      setFormData({
        route_name: routeToEdit.route_name,
        vehicle_id: routeToEdit.vehicle_id || "",
        start_point: routeToEdit.start_point,
        end_point: routeToEdit.end_point,
      });
      if (routeToEdit.stops && routeToEdit.stops.length > 0) {
        setStops(
          routeToEdit.stops.map((s) => ({
            stop_name: s.stop_name,
            pickup_time: s.pickup_time,
            drop_time: s.drop_time,
            fare: s.fare,
          }))
        );
      }
    }
  }, [routeToEdit]);

  const mutation = useMutation({
    mutationFn: (data) =>
      routeToEdit
        ? transportAPI.updateRoute(routeToEdit.id, data)
        : transportAPI.createRoute(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["transport-routes"]);
      toast.success(routeToEdit ? "Route updated" : "Route created");
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
              onChange={(e) => updateStop(idx, "pickup_time", e.target.value)}
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
          {routeToEdit ? "Update Route" : "Create Route"}
        </button>
      </div>
    </form>
  );
};

const AllocationForm = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    student_id: "",
    route_id: "",
    pickup_stop_id: "",
    drop_stop_id: "",
    seat_number: "",
  });

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
    mutationFn: transportAPI.allocateTransport,
    onSuccess: () => {
      queryClient.invalidateQueries(["transport-allocations"]);
      toast.success("Allocated");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <select
        required
        className="w-full border rounded px-3 py-2"
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
        onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
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
          Allocate
        </button>
      </div>
    </form>
  );
};

export default TransportationManagement;
