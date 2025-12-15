const db = require("../config/database");

// ==========================================
// VEHICLE MANAGEMENT
// ==========================================

exports.getAllVehicles = async (req, res, next) => {
  try {
    const [vehicles] = await db.query(
      "SELECT * FROM transport_vehicles ORDER BY bus_number ASC"
    );
    res.status(200).json({ success: true, data: vehicles });
  } catch (error) {
    next(error);
  }
};

exports.createVehicle = async (req, res, next) => {
  try {
    const {
      bus_number,
      registration_number,
      driver_name,
      driver_phone,
      sub_driver_name,
      sub_driver_phone,
      capacity,
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO transport_vehicles 
      (bus_number, registration_number, driver_name, driver_phone, sub_driver_name, sub_driver_phone, capacity) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        bus_number,
        registration_number,
        driver_name,
        driver_phone,
        sub_driver_name,
        sub_driver_phone,
        capacity || 40,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Vehicle added successfully",
      data: { id: result.insertId, ...req.body },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      bus_number,
      registration_number,
      driver_name,
      driver_phone,
      sub_driver_name,
      sub_driver_phone,
      capacity,
    } = req.body;

    await db.query(
      `UPDATE transport_vehicles 
             SET bus_number = ?, registration_number = ?, driver_name = ?, driver_phone = ?, sub_driver_name = ?, sub_driver_phone = ?, capacity = ?
             WHERE id = ?`,
      [
        bus_number,
        registration_number,
        driver_name,
        driver_phone,
        sub_driver_name,
        sub_driver_phone,
        capacity,
        id,
      ]
    );

    res
      .status(200)
      .json({ success: true, message: "Vehicle updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.deleteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Check for dependencies (routes)
    const [routes] = await db.query(
      "SELECT id FROM transport_routes WHERE vehicle_id = ?",
      [id]
    );
    if (routes.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete vehicle assigned to routes",
      });
    }

    await db.query("DELETE FROM transport_vehicles WHERE id = ?", [id]);
    res
      .status(200)
      .json({ success: true, message: "Vehicle deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ROUTE & STOP MANAGEMENT
// ==========================================

exports.getAllRoutes = async (req, res, next) => {
  try {
    const [routes] = await db.query(`
      SELECT tr.*, tv.bus_number, tv.driver_name 
      FROM transport_routes tr
      LEFT JOIN transport_vehicles tv ON tr.vehicle_id = tv.id
      ORDER BY tr.route_name ASC
    `);

    // Fetch stops for each route
    for (let route of routes) {
      const [stops] = await db.query(
        "SELECT * FROM transport_stops WHERE route_id = ? ORDER BY sequence_order ASC",
        [route.id]
      );
      route.stops = stops;
    }

    res.status(200).json({ success: true, data: routes });
  } catch (error) {
    next(error);
  }
};

exports.createRoute = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { route_name, vehicle_id, start_point, end_point, stops } = req.body;

    // Fetch vehicle details for legacy columns
    let vehicleData = {
      vehicle_number: "Unassigned",
      driver_name: "Unassigned",
      driver_phone: "0000000000",
    };

    if (vehicle_id) {
      const [v] = await connection.query(
        "SELECT bus_number, driver_name, driver_phone FROM transport_vehicles WHERE id = ?",
        [vehicle_id]
      );
      if (v.length > 0) {
        vehicleData = {
          vehicle_number: v[0].bus_number,
          driver_name: v[0].driver_name,
          driver_phone: v[0].driver_phone,
        };
      }
    }

    // Create Route
    const [routeResult] = await connection.query(
      `INSERT INTO transport_routes 
       (route_name, vehicle_id, start_point, end_point, vehicle_number, driver_name, driver_phone) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        route_name,
        vehicle_id || null,
        start_point,
        end_point,
        vehicleData.vehicle_number,
        vehicleData.driver_name,
        vehicleData.driver_phone,
      ]
    );

    const routeId = routeResult.insertId;

    // Add Stops
    if (stops && stops.length > 0) {
      for (let i = 0; i < stops.length; i++) {
        const stop = stops[i];
        await connection.query(
          `INSERT INTO transport_stops (route_id, stop_name, pickup_time, drop_time, fare, sequence_order) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            routeId,
            stop.stop_name,
            stop.pickup_time,
            stop.drop_time,
            stop.fare || 0,
            i + 1,
          ]
        );
      }
    }

    await connection.commit();
    res
      .status(201)
      .json({ success: true, message: "Route created successfully" });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

exports.updateRoute = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    const { route_name, vehicle_id, start_point, end_point, stops } = req.body;

    // Fetch vehicle details for legacy columns
    let vehicleData = {
      vehicle_number: "Unassigned",
      driver_name: "Unassigned",
      driver_phone: "0000000000",
    };

    if (vehicle_id) {
      const [v] = await connection.query(
        "SELECT bus_number, driver_name, driver_phone FROM transport_vehicles WHERE id = ?",
        [vehicle_id]
      );
      if (v.length > 0) {
        vehicleData = {
          vehicle_number: v[0].bus_number,
          driver_name: v[0].driver_name,
          driver_phone: v[0].driver_phone,
        };
      }
    }

    // Update Route
    await connection.query(
      `UPDATE transport_routes 
       SET route_name = ?, vehicle_id = ?, start_point = ?, end_point = ?,
           vehicle_number = ?, driver_name = ?, driver_phone = ?
       WHERE id = ?`,
      [
        route_name,
        vehicle_id || null,
        start_point,
        end_point,
        vehicleData.vehicle_number,
        vehicleData.driver_name,
        vehicleData.driver_phone,
        id,
      ]
    );

    // Update Stops (Upsert Strategy to preserve IDs and allocations)
    if (stops) {
      // 1. Get existing stop IDs for this route
      const [existingStops] = await connection.query(
        "SELECT id FROM transport_stops WHERE route_id = ?",
        [id]
      );
      const existingIds = existingStops.map((s) => s.id);

      // 2. Identify stops to delete (exist in DB but not in incoming list)
      const incomingIds = stops
        .filter((s) => s.id) // Only consider ones that have an ID
        .map((s) => s.id);

      const toDelete = existingIds.filter((eid) => !incomingIds.includes(eid));

      if (toDelete.length > 0) {
        await connection.query(
          "DELETE FROM transport_stops WHERE id IN (?)",
          [toDelete]
        );
      }

      // 3. Upsert (Update existing, Insert new)
      if (stops.length > 0) {
        for (let i = 0; i < stops.length; i++) {
          const stop = stops[i];

          if (stop.id && existingIds.includes(stop.id)) {
            // Update existing
            await connection.query(
              `UPDATE transport_stops 
               SET stop_name = ?, pickup_time = ?, drop_time = ?, fare = ?, sequence_order = ?
               WHERE id = ?`,
              [
                stop.stop_name,
                stop.pickup_time,
                stop.drop_time,
                stop.fare || 0,
                i + 1,
                stop.id,
              ]
            );
          } else {
            // Insert new
            await connection.query(
              `INSERT INTO transport_stops (route_id, stop_name, pickup_time, drop_time, fare, sequence_order) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                id,
                stop.stop_name,
                stop.pickup_time,
                stop.drop_time,
                stop.fare || 0,
                i + 1,
              ]
            );
          }
        }
      }
    }

    await connection.commit();
    res
      .status(200)
      .json({ success: true, message: "Route updated successfully" });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

exports.deleteRoute = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Check for allocations
    const [allocations] = await db.query(
      "SELECT id FROM transport_allocations WHERE route_id = ? AND status = 'active'",
      [id]
    );
    if (allocations.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete route with active allocations",
      });
    }

    await db.query("DELETE FROM transport_routes WHERE id = ?", [id]);
    res
      .status(200)
      .json({ success: true, message: "Route deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ALLOCATION MANAGEMENT
// ==========================================

exports.allocateTransport = async (req, res, next) => {
  try {
    const { student_id, route_id, pickup_stop_id, drop_stop_id, seat_number } =
      req.body;

    // Check if student already has allocation
    const [existing] = await db.query(
      "SELECT id FROM transport_allocations WHERE student_id = ? AND status = 'active'",
      [student_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Student already allocated to a bus",
      });
    }

    // Check seat availability (optional strict check)
    if (seat_number) {
      const [seatTaken] = await db.query(
        "SELECT id FROM transport_allocations WHERE route_id = ? AND seat_number = ? AND status = 'active'",
        [route_id, seat_number]
      );
      if (seatTaken.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Seat ${seat_number} is already taken on this route`,
        });
      }
    }

    await db.query(
      `INSERT INTO transport_allocations (student_id, route_id, pickup_stop_id, drop_stop_id, seat_number) 
       VALUES (?, ?, ?, ?, ?)`,
      [student_id, route_id, pickup_stop_id, drop_stop_id, seat_number]
    );

    res
      .status(201)
      .json({ success: true, message: "Transport allocated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.updateAllocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { route_id, pickup_stop_id, drop_stop_id, seat_number } = req.body;

    // Check if allocation exists
    const [existing] = await db.query(
      "SELECT id FROM transport_allocations WHERE id = ? AND status = 'active'",
      [id]
    );

    if (existing.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Allocation not found" });
    }

    // Check seat availability (if changing seat)
    if (seat_number) {
      const [seatTaken] = await db.query(
        "SELECT id FROM transport_allocations WHERE route_id = ? AND seat_number = ? AND status = 'active' AND id != ?",
        [route_id, seat_number, id]
      );
      if (seatTaken.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Seat ${seat_number} is already taken on this route`,
        });
      }
    }

    await db.query(
      `UPDATE transport_allocations 
       SET route_id = ?, pickup_stop_id = ?, drop_stop_id = ?, seat_number = ?
       WHERE id = ?`,
      [route_id, pickup_stop_id, drop_stop_id, seat_number, id]
    );

    res
      .status(200)
      .json({ success: true, message: "Allocation updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getAllocations = async (req, res, next) => {
  try {
    const [allocations] = await db.query(`
      SELECT ta.*, 
             s.first_name, s.last_name, s.admission_number, s.class_id,
             tr.route_name, tv.bus_number,
             ts_pickup.stop_name as pickup_point, ts_drop.stop_name as drop_point
      FROM transport_allocations ta
      LEFT JOIN students s ON ta.student_id = s.id
      LEFT JOIN transport_routes tr ON ta.route_id = tr.id
      LEFT JOIN transport_vehicles tv ON tr.vehicle_id = tv.id
      LEFT JOIN transport_stops ts_pickup ON ta.pickup_stop_id = ts_pickup.id
      LEFT JOIN transport_stops ts_drop ON ta.drop_stop_id = ts_drop.id
      WHERE ta.status = 'active'
      ORDER BY ta.created_at DESC
    `);

    res.status(200).json({ success: true, data: allocations });
  } catch (error) {
    next(error);
  }
};

exports.cancelAllocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query(
      "UPDATE transport_allocations SET status = 'cancelled' WHERE id = ?",
      [id]
    );
    res.status(200).json({ success: true, message: "Allocation cancelled" });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// STUDENT DASHBOARD
// ==========================================

exports.getMyTransport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let studentId;
    if (role === "student") {
      const [student] = await db.query(
        "SELECT id FROM students WHERE user_id = ?",
        [userId]
      );
      if (student.length === 0)
        return res
          .status(404)
          .json({ success: false, message: "Student not found" });
      studentId = student[0].id;
    } else {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const [allocation] = await db.query(
      `
      SELECT ta.*, 
             tr.route_name, tr.start_point, tr.end_point,
             tv.bus_number, tv.registration_number, tv.driver_name, tv.driver_phone, tv.sub_driver_name, tv.sub_driver_phone,
             ts_pickup.stop_name as pickup_name, ts_pickup.pickup_time,
             ts_drop.stop_name as drop_name, ts_drop.drop_time
      FROM transport_allocations ta
      JOIN transport_routes tr ON ta.route_id = tr.id
      LEFT JOIN transport_vehicles tv ON tr.vehicle_id = tv.id
      LEFT JOIN transport_stops ts_pickup ON ta.pickup_stop_id = ts_pickup.id
      LEFT JOIN transport_stops ts_drop ON ta.drop_stop_id = ts_drop.id
      WHERE ta.student_id = ? AND ta.status = 'active'
    `,
      [studentId]
    );

    if (allocation.length === 0) {
      return res
        .status(200)
        .json({ success: true, data: null, message: "No transport allocated" });
    }

    res.status(200).json({ success: true, data: allocation[0] });
  } catch (error) {
    next(error);
  }
};
