const db = require("../config/database");

// Get all rooms with filters
exports.getAllRooms = async (req, res, next) => {
  try {
    const { type, status } = req.query;
    let query = "SELECT * FROM hostel_rooms WHERE 1=1";
    const params = [];

    if (type) {
      query += " AND type = ?";
      params.push(type);
    }
    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    query += " ORDER BY room_number ASC";

    const [rooms] = await db.query(query, params);

    res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new room
exports.createRoom = async (req, res, next) => {
  try {
    const { room_number, building_name, type, capacity } = req.body;

    // Check if room already exists
    const [existing] = await db.query(
      "SELECT id FROM hostel_rooms WHERE room_number = ? AND building_name = ?",
      [room_number, building_name || "Main Hostel"]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Room number already exists in this building",
      });
    }

    const [result] = await db.query(
      "INSERT INTO hostel_rooms (room_number, building_name, type, capacity) VALUES (?, ?, ?, ?)",
      [room_number, building_name || "Main Hostel", type, capacity || 4]
    );

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: { id: result.insertId, ...req.body },
    });
  } catch (error) {
    next(error);
  }
};

// Allocate a room to a student
exports.allocateRoom = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { student_id, room_id } = req.body;

    // 1. Check if student exists and get gender
    const [student] = await connection.query(
      "SELECT id, gender, first_name, last_name FROM students WHERE id = ?",
      [student_id]
    );

    if (student.length === 0) {
      throw new Error("Student not found");
    }

    // 2. Check if student already has an active allocation
    const [existingAllocation] = await connection.query(
      "SELECT id FROM hostel_allocations WHERE student_id = ? AND status = 'active'",
      [student_id]
    );

    if (existingAllocation.length > 0) {
      throw new Error("Student is already allocated to a room");
    }

    // 3. Check room details (capacity, type)
    const [room] = await connection.query(
      "SELECT * FROM hostel_rooms WHERE id = ?",
      [room_id]
    );

    if (room.length === 0) {
      throw new Error("Room not found");
    }

    if (room[0].current_occupancy >= room[0].capacity) {
      throw new Error("Room is fully occupied");
    }

    if (room[0].type !== student[0].gender) {
      throw new Error(
        `Cannot allocate ${student[0].gender} student to ${room[0].type} room`
      );
    }

    if (room[0].status !== "active") {
      throw new Error("Room is under maintenance or inactive");
    }

    // 4. Create allocation
    await connection.query(
      "INSERT INTO hostel_allocations (student_id, room_id, status) VALUES (?, ?, 'active')",
      [student_id, room_id]
    );

    // 5. Update room occupancy
    await connection.query(
      "UPDATE hostel_rooms SET current_occupancy = current_occupancy + 1 WHERE id = ?",
      [room_id]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Room allocated successfully",
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// Vacate a room
exports.vacateRoom = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { allocation_id } = req.body;

    // Get allocation details
    const [allocation] = await connection.query(
      "SELECT * FROM hostel_allocations WHERE id = ? AND status = 'active'",
      [allocation_id]
    );

    if (allocation.length === 0) {
      throw new Error("Active allocation not found");
    }

    // Update allocation status
    await connection.query(
      "UPDATE hostel_allocations SET status = 'vacated' WHERE id = ?",
      [allocation_id]
    );

    // Decrease room occupancy
    await connection.query(
      "UPDATE hostel_rooms SET current_occupancy = current_occupancy - 1 WHERE id = ?",
      [allocation[0].room_id]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Room vacated successfully",
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// Get room details with occupants
exports.getRoomDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [room] = await db.query("SELECT * FROM hostel_rooms WHERE id = ?", [
      id,
    ]);

    if (room.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    const [occupants] = await db.query(
      `SELECT s.id, s.first_name, s.last_name, s.admission_number, s.class_id, ha.allocation_date, ha.id as allocation_id
       FROM hostel_allocations ha
       JOIN students s ON ha.student_id = s.id
       WHERE ha.room_id = ? AND ha.status = 'active'`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...room[0],
        occupants,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get student's hostel details (For Student Dashboard)
exports.getStudentHostelDetails = async (req, res, next) => {
  try {
    // Assuming req.user.id is the user_id from auth token.
    // We need to find the student record linked to this user_id first.
    // However, the auth middleware might attach 'student' or 'user'.
    // I'll assume req.user.id corresponds to the `users` table, and `students` table has `user_id`.

    const userId = req.user.id;
    const role = req.user.role;

    let studentId;

    if (role === "student") {
      const [student] = await db.query(
        "SELECT id FROM students WHERE user_id = ?",
        [userId]
      );
      if (student.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Student profile not found" });
      }
      studentId = student[0].id;
    } else {
      // If admin is checking for a specific student (optional, but good to have)
      if (req.query.student_id) {
        studentId = req.query.student_id;
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Student ID required" });
      }
    }

    const [allocation] = await db.query(
      `SELECT ha.*, hr.room_number, hr.building_name, hr.type
       FROM hostel_allocations ha
       JOIN hostel_rooms hr ON ha.room_id = hr.id
       WHERE ha.student_id = ? AND ha.status = 'active'`,
      [studentId]
    );

    if (allocation.length === 0) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "No active hostel allocation found",
      });
    }

    // Get room partners
    const [partners] = await db.query(
      `SELECT s.first_name, s.last_name, s.class_id
       FROM hostel_allocations ha
       JOIN students s ON ha.student_id = s.id
       WHERE ha.room_id = ? AND ha.status = 'active' AND ha.student_id != ?`,
      [allocation[0].room_id, studentId]
    );

    res.status(200).json({
      success: true,
      data: {
        allocation: allocation[0],
        partners,
      },
    });
  } catch (error) {
    next(error);
  }
};
// Update room details
exports.updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { room_number, building_name, type, capacity, status } = req.body;

    // Check if room exists
    const [existing] = await db.query(
      "SELECT * FROM hostel_rooms WHERE id = ?",
      [id]
    );
    if (existing.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    // Check for duplicates if room number or building changed
    if (
      (room_number && room_number !== existing[0].room_number) ||
      (building_name && building_name !== existing[0].building_name)
    ) {
      const [duplicate] = await db.query(
        "SELECT id FROM hostel_rooms WHERE room_number = ? AND building_name = ? AND id != ?",
        [
          room_number || existing[0].room_number,
          building_name || existing[0].building_name,
          id,
        ]
      );
      if (duplicate.length > 0) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Room number already exists in this building",
          });
      }
    }

    // Validate capacity vs occupancy
    if (capacity && capacity < existing[0].current_occupancy) {
      return res.status(400).json({
        success: false,
        message: `Cannot reduce capacity below current occupancy (${existing[0].current_occupancy})`,
      });
    }

    await db.query(
      `UPDATE hostel_rooms 
             SET room_number = COALESCE(?, room_number),
                 building_name = COALESCE(?, building_name),
                 type = COALESCE(?, type),
                 capacity = COALESCE(?, capacity),
                 status = COALESCE(?, status)
             WHERE id = ?`,
      [room_number, building_name, type, capacity, status, id]
    );

    res
      .status(200)
      .json({ success: true, message: "Room updated successfully" });
  } catch (error) {
    next(error);
  }
};

// Delete room
exports.deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check occupancy
    const [room] = await db.query(
      "SELECT current_occupancy FROM hostel_rooms WHERE id = ?",
      [id]
    );
    if (room.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    if (room[0].current_occupancy > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete room with active occupants. Please vacate them first.",
      });
    }

    await db.query("DELETE FROM hostel_rooms WHERE id = ?", [id]);

    res
      .status(200)
      .json({ success: true, message: "Room deleted successfully" });
  } catch (error) {
    next(error);
  }
};
