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
  X,
  User,
  Phone,
  Search,
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transportation Management</h1>
        <p className="text-gray-600 mt-1">
          Manage buses, routes, and student allocations
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab("vehicles")}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "vehicles"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
            >
              <Bus className="w-4 h-4 mr-2" />
              Vehicles
            </button>
            <button
              onClick={() => setActiveTab("routes")}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "routes"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Routes
            </button>
            <button
              onClick={() => setActiveTab("allocations")}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "allocations"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
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
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "my-transport"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
              }`}
          >
            <Bus className="w-4 h-4 mr-2" />
            My Transport
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md min-h-[600px] overflow-hidden">
        {activeTab === "vehicles" && isAdmin && <VehiclesTab />}
        {activeTab === "routes" && isAdmin && <RoutesTab />}
        {activeTab === "allocations" && isAdmin && <AllocationsTab />}
        {activeTab === "my-transport" && <MyTransportTab />}
      </div>
    </div>
  );
};

// ==========================================
// VEHICLES TAB (Split View)
// ==========================================
const VehiclesTab = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["transport-vehicles"],
    queryFn: () => transportAPI.getAllVehicles().then((res) => res.data || []),
  });

  // Select first vehicle by default
  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(vehicles[0]);
    }
  }, [vehicles]);

  const deleteMutation = useMutation({
    mutationFn: transportAPI.deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries(["transport-vehicles"]);
      toast.success("Vehicle deleted");
      setSelectedVehicle(null);
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

  const filteredVehicles = vehicles.filter((v) =>
    v.bus_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.driver_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading vehicles...</div>;
  }

  return (
    <div className="flex h-[600px]">
      {/* Sidebar List */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Bus Fleet</h2>
              <p className="text-xs text-gray-500">{vehicles.length} Vehicles</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bus or driver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredVehicles.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No vehicles found</div>
          ) : (
            filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => setSelectedVehicle(vehicle)}
                className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedVehicle?.id === vehicle.id
                  ? "bg-blue-50 border-blue-200 shadow-sm"
                  : "bg-white border-transparent hover:bg-gray-50"
                  }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-semibold text-gray-900">{vehicle.bus_number}</div>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${vehicle.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {vehicle.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500 truncate">{vehicle.registration_number}</div>
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <User className="w-3 h-3 mr-1" />
                  <span className="truncate">{vehicle.driver_name}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        {selectedVehicle ? (
          <div className="p-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Detail Header */}
              <div className="bg-gradient-to-r from-blue-700 to-blue-800 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Bus className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedVehicle.bus_number}</h2>
                      <p className="text-blue-100 opacity-90">{selectedVehicle.registration_number}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(selectedVehicle)}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                      title="Edit Vehicle"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedVehicle.id)}
                      className="p-2 bg-white/10 hover:bg-red-500/20 rounded-lg text-white hover:text-red-100 transition-colors"
                      title="Delete Vehicle"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-gray-100">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-xs font-bold text-blue-600 uppercase">Capacity</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedVehicle.capacity}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <p className="text-xs font-bold text-green-600 uppercase">Status</p>
                  <p className="text-xl font-bold text-gray-900 capitalize">{selectedVehicle.status}</p>
                </div>
              </div>

              {/* Driver Info */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-gray-500" /> Crew Details
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-3">Main Driver</p>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                        {selectedVehicle.driver_name?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{selectedVehicle.driver_name}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {selectedVehicle.driver_phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedVehicle.sub_driver_name && (
                    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-3">Sub Driver</p>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold">
                          {selectedVehicle.sub_driver_name?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{selectedVehicle.sub_driver_name}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {selectedVehicle.sub_driver_phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Bus className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a vehicle to view details</p>
          </div>
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
// ROUTES TAB (Split View)
// ==========================================
const RoutesTab = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: routes = [], isLoading } = useQuery({
    queryKey: ["transport-routes"],
    queryFn: () => transportAPI.getAllRoutes().then((res) => res.data || []),
  });

  // Select first route by default
  useEffect(() => {
    if (routes.length > 0 && !selectedRoute) {
      setSelectedRoute(routes[0]);
    }
  }, [routes]);

  const deleteMutation = useMutation({
    mutationFn: transportAPI.deleteRoute,
    onSuccess: () => {
      queryClient.invalidateQueries(["transport-routes"]);
      toast.success("Route deleted");
      setSelectedRoute(null);
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

  const filteredRoutes = routes.filter((r) =>
    r.route_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.start_point.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading routes...</div>;
  }

  return (
    <div className="flex h-[600px]">
      {/* Sidebar List */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Route Network</h2>
              <p className="text-xs text-gray-500">{routes.length} Active Routes</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search routes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredRoutes.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No routes found</div>
          ) : (
            filteredRoutes.map((route) => (
              <div
                key={route.id}
                onClick={() => setSelectedRoute(route)}
                className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedRoute?.id === route.id
                  ? "bg-blue-50 border-blue-200 shadow-sm"
                  : "bg-white border-transparent hover:bg-gray-50"
                  }`}
              >
                <div className="font-semibold text-gray-900 mb-1">{route.route_name}</div>
                <div className="flex items-center text-xs text-gray-500 gap-1.5 mb-1">
                  <span className="truncate max-w-[80px]">{route.start_point}</span>
                  <span>→</span>
                  <span className="truncate max-w-[80px]">{route.end_point}</span>
                </div>
                {route.bus_number && (
                  <div className="text-[10px] text-blue-600 bg-blue-50 inline-block px-1.5 py-0.5 rounded">
                    {route.bus_number}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        {selectedRoute ? (
          <div className="p-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Detail Header */}
              <div className="bg-white p-6 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    {selectedRoute.route_name}
                  </h2>
                  <div className="flex items-center gap-3 mt-2 text-gray-600">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-4 h-4 text-green-600" /> {selectedRoute.start_point}
                    </span>
                    <span className="text-gray-300">➜</span>
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-4 h-4 text-red-600" /> {selectedRoute.end_point}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(selectedRoute)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(selectedRoute.id)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Assigned Bus Check */}
              <div className="px-6 py-4 bg-blue-50/50 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Assigned Bus</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {selectedRoute.bus_number ? `${selectedRoute.bus_number} (${selectedRoute.driver_name || 'No Driver'})` : 'No Bus Assigned'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stops Visualization */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Route Stops</h3>
                <div className="relative pl-4 border-l-2 border-dashed border-gray-200 space-y-8 ml-4">
                  {selectedRoute.stops?.map((stop, idx) => (
                    <div key={stop.id} className="relative">
                      <div className={`absolute -left-[25px] top-0 w-5 h-5 rounded-full border-2 ${idx === 0 ? 'bg-green-500 border-green-500' :
                        idx === selectedRoute.stops.length - 1 ? 'bg-red-500 border-red-500' :
                          'bg-white border-blue-500'
                        }`}></div>

                      <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">{stop.stop_name}</span>
                          <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {stop.pickup_time?.slice(0, 5) || '--:--'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )) || <p className="text-gray-500 italic">No stops defined.</p>}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Navigation className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a route to view details</p>
          </div>
        )}
      </div>

      {showModal && (
        <AddRouteModal onClose={handleCloseModal} initialData={editingRoute} />
      )}
    </div>
  );
};

// ==========================================
// ALLOCATIONS TAB (Table View)
// ==========================================
const AllocationsTab = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState(null);
  const queryClient = useQueryClient();

  const { data: allocations = [], isLoading } = useQuery({
    queryKey: ["transport-allocations"],
    queryFn: () => transportAPI.getAllLocations().then((res) => res.data || []),
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Student Allocations</h2>
          <p className="text-sm text-gray-500">{allocations.length} Active Associations</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" /> Allocate Student
        </button>
      </div>

      <div className="bg-white table-wrapper rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Route Info</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Points</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Seat</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : allocations.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">No allocations found</td></tr>
            ) : (
              allocations.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                        {a.first_name?.[0]}{a.last_name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{a.first_name} {a.last_name}</p>
                        <p className="text-xs text-gray-500">{a.admission_number}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{a.route_name}</p>
                    <p className="text-xs text-gray-500">{a.bus_number}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {a.pickup_point}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        {a.drop_point}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-sm font-mono font-bold text-gray-700">
                      {a.seat_number || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(a)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if (confirm("Cancel?")) cancelMutation.mutate(a.id) }} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed m-6">
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
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {data.route_name}
            </h2>
            <p className="text-gray-700 font-medium">
              {data.bus_number} ({data.registration_number})
            </p>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-lg shadow-sm text-center border border-blue-200">
            <span className="text-sm text-gray-500 block">Seat Number</span>
            <span className="text-2xl font-bold text-blue-700">
              {data.seat_number || "N/A"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm border-l-4 border-blue-600">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">
              Pickup Point
            </p>
            <p className="font-bold text-lg text-gray-900">{data.pickup_name}</p>
            <p className="text-sm text-gray-600">
              Time: {data.pickup_time?.slice(0, 5)}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm border-l-4 border-gray-600">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">
              Drop Point
            </p>
            <p className="font-bold text-lg text-gray-900">{data.drop_name}</p>
            <p className="text-sm text-gray-600">
              Time: {data.drop_time?.slice(0, 5)}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h4 className="font-bold text-gray-800 mb-3 flex items-center">
            <UserCheck className="w-4 h-4 mr-2" /> Driver Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Driver</p>
              <p className="font-medium text-gray-900">{data.driver_name}</p>
              <p className="text-sm text-blue-600 flex items-center gap-1"><Phone className="w-3 h-3" /> {data.driver_phone}</p>
            </div>
            {data.sub_driver_name && (
              <div>
                <p className="text-sm text-gray-500">Sub-Driver</p>
                <p className="font-medium text-gray-900">{data.sub_driver_name}</p>
                <p className="text-sm text-blue-600 flex items-center gap-1"><Phone className="w-3 h-3" /> {data.sub_driver_phone}</p>
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
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit Vehicle" : "Add New Vehicle"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bus Number</label>
              <input
                required
                placeholder="e.g. Bus-01"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.bus_number}
                onChange={(e) =>
                  setFormData({ ...formData, bus_number: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reg. Number</label>
              <input
                required
                placeholder="e.g. BA 2 PA 0000"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.registration_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registration_number: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
              <input
                required
                placeholder="Name"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.driver_name}
                onChange={(e) =>
                  setFormData({ ...formData, driver_name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver Phone</label>
              <input
                required
                placeholder="Phone"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.driver_phone}
                onChange={(e) =>
                  setFormData({ ...formData, driver_phone: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Driver (Opt)</label>
              <input
                placeholder="Name"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.sub_driver_name}
                onChange={(e) =>
                  setFormData({ ...formData, sub_driver_name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Driver Phone</label>
              <input
                placeholder="Phone"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.sub_driver_phone}
                onChange={(e) =>
                  setFormData({ ...formData, sub_driver_phone: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input
              type="number"
              placeholder="40"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm"
            >
              {mutation.isPending
                ? "Saving..."
                : initialData
                  ? "Update Vehicle"
                  : "Create Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddRouteModal = ({ onClose, initialData }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    route_name: "",
    start_point: "",
    end_point: "",
    vehicle_id: "",
    stops: [],
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["transport-vehicles"],
    queryFn: () => transportAPI.getAllVehicles().then((res) => res.data || []),
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        route_name: initialData.route_name,
        start_point: initialData.start_point,
        end_point: initialData.end_point,
        vehicle_id: initialData.vehicle_id || "",
        stops: initialData.stops || [],
      });
    }
  }, [initialData]);

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

  const handleAddStop = () => {
    setFormData({
      ...formData,
      stops: [
        ...formData.stops,
        { stop_name: "", pickup_time: "", drop_time: "", sequence_order: formData.stops.length + 1 },
      ],
    });
  };

  const handleStopChange = (index, field, value) => {
    const newStops = [...formData.stops];
    newStops[index][field] = value;
    setFormData({ ...formData, stops: newStops });
  };

  const handleRemoveStop = (index) => {
    const newStops = formData.stops.filter((_, i) => i !== index);
    setFormData({ ...formData, stops: newStops });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit Route" : "Create New Route"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Route Name</label>
              <input
                required
                placeholder="Route Name"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.route_name}
                onChange={(e) =>
                  setFormData({ ...formData, route_name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.vehicle_id}
                onChange={(e) =>
                  setFormData({ ...formData, vehicle_id: e.target.value })
                }
              >
                <option value="">-- Select Bus --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.bus_number} ({v.driver_name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Point</label>
              <input
                required
                placeholder="Start Point"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.start_point}
                onChange={(e) =>
                  setFormData({ ...formData, start_point: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Point</label>
              <input
                required
                placeholder="End Point"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.end_point}
                onChange={(e) =>
                  setFormData({ ...formData, end_point: e.target.value })
                }
              />
            </div>
          </div>

          {/* Stops Section */}
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-gray-700">Route Stops</label>
              <button
                type="button"
                onClick={handleAddStop}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Stop
              </button>
            </div>

            <div className="space-y-3">
              {formData.stops.map((stop, index) => (
                <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex-1">
                    <input
                      placeholder="Stop Name"
                      className="w-full border rounded px-2 py-1 text-sm mb-2"
                      value={stop.stop_name}
                      onChange={(e) => handleStopChange(index, "stop_name", e.target.value)}
                    />
                    <div className="flex gap-2">
                      <input
                        type="time"
                        className="w-1/2 border rounded px-2 py-1 text-xs"
                        value={stop.pickup_time}
                        onChange={(e) => handleStopChange(index, "pickup_time", e.target.value)}
                      />
                      <input
                        type="time"
                        className="w-1/2 border rounded px-2 py-1 text-xs"
                        value={stop.drop_time}
                        onChange={(e) => handleStopChange(index, "drop_time", e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStop(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm"
            >
              {mutation.isPending ? "Saving..." : initialData ? "Update Route" : "Create Route"}
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
    pickup_point: "",
    drop_point: "",
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

  useEffect(() => {
    if (initialData) {
      setFormData({
        student_id: initialData.student_id,
        route_id: initialData.route_id,
        pickup_point: initialData.pickup_point,
        drop_point: initialData.drop_point,
        seat_number: initialData.seat_number || "",
      });
    }
  }, [initialData]);

  const mutation = useMutation({
    mutationFn: (data) =>
      initialData
        ? transportAPI.updateAllocation(initialData.id, data)
        : transportAPI.allocateTransport(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["transport-allocations"]);
      toast.success(initialData ? "Allocation updated" : "Student allocated");
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const selectedRoute = routes.find(r => r.id == formData.route_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit Allocation" : "Allocate Student"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
            <select
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              disabled={!!initialData}
            >
              <option value="">-- Select Student --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name} ({s.admission_number})
                </option>
              ))}
            </select>
          </div>

          {/* Route Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Route</label>
            <select
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.route_id}
              onChange={(e) => setFormData({ ...formData, route_id: e.target.value, pickup_point: "", drop_point: "" })}
            >
              <option value="">-- Select Route --</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.route_name} ({r.start_point} - {r.end_point})
                </option>
              ))}
            </select>
          </div>

          {/* Points */}
          {selectedRoute && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Point</label>
                <select
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.pickup_point}
                  onChange={(e) => setFormData({ ...formData, pickup_point: e.target.value })}
                >
                  <option value="">-- Select --</option>
                  <option value={selectedRoute.start_point}>{selectedRoute.start_point}</option>
                  {selectedRoute.stops?.map(s => <option key={s.id} value={s.stop_name}>{s.stop_name}</option>)}
                  <option value={selectedRoute.end_point}>{selectedRoute.end_point}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Drop Point</label>
                <select
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.drop_point}
                  onChange={(e) => setFormData({ ...formData, drop_point: e.target.value })}
                >
                  <option value="">-- Select --</option>
                  <option value={selectedRoute.start_point}>{selectedRoute.start_point}</option>
                  {selectedRoute.stops?.map(s => <option key={s.id} value={s.stop_name}>{s.stop_name}</option>)}
                  <option value={selectedRoute.end_point}>{selectedRoute.end_point}</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seat Number (Optional)</label>
            <input
              placeholder="e.g. 12A"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.seat_number}
              onChange={(e) =>
                setFormData({ ...formData, seat_number: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm"
            >
              {mutation.isPending ? "Saving..." : "Allocate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransportationManagement;
