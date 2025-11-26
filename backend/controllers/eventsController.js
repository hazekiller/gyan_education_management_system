const pool = require("../config/database");

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const { status, event_type, target_audience, is_holiday, start_date, end_date } = req.query;

    let query = `
      SELECT 
        e.*,
        u.email as created_by_email,
        COALESCE(
          CONCAT(t.first_name, ' ', t.last_name),
          CONCAT(st.first_name, ' ', st.last_name),
          u.email
        ) as created_by_name
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN teachers t ON u.id = t.user_id
      LEFT JOIN staff st ON u.id = st.user_id
      WHERE 1=1
    `;

    const params = [];

    if (status === 'upcoming') {
      query += " AND e.event_date >= CURDATE() AND e.is_active = 1";
    } else if (status === 'past') {
      query += " AND e.event_date < CURDATE()";
    } else if (status === 'today') {
      query += " AND e.event_date = CURDATE() AND e.is_active = 1";
    } else if (status === 'active') {
      query += " AND e.is_active = 1";
    } else if (status === 'inactive') {
      query += " AND e.is_active = 0";
    }

    if (event_type) {
      query += " AND e.event_type = ?";
      params.push(event_type);
    }

    if (target_audience) {
      query += " AND e.target_audience = ?";
      params.push(target_audience);
    }

    if (is_holiday !== undefined) {
      query += " AND e.is_holiday = ?";
      params.push(is_holiday === 'true' || is_holiday === '1' ? 1 : 0);
    }

    if (start_date) {
      query += " AND e.event_date >= ?";
      params.push(start_date);
    }

    if (end_date) {
      query += " AND e.event_date <= ?";
      params.push(end_date);
    }

    query += " ORDER BY e.event_date ASC, e.start_time ASC, e.id DESC";

    const [events] = await pool.query(query, params);

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message,
    });
  }
};

// Get events for logged-in user (role-based)
const getMyEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = "";
    let params = [];

    // Admin roles see all active events
    const adminRoles = ["super_admin", "principal", "vice_principal", "hod"];
    
    if (adminRoles.includes(userRole)) {
      query = `
        SELECT 
          e.*,
          u.email as created_by_email,
          COALESCE(
            CONCAT(t.first_name, ' ', t.last_name),
            CONCAT(st.first_name, ' ', st.last_name),
            u.email
          ) as created_by_name
        FROM events e
        LEFT JOIN users u ON e.created_by = u.id
        LEFT JOIN teachers t ON u.id = t.user_id
        LEFT JOIN staff st ON u.id = st.user_id
        WHERE e.is_active = 1 
          AND e.event_date >= CURDATE()
        ORDER BY e.event_date ASC, e.start_time ASC
      `;
    } else if (userRole === "teacher") {
      query = `
        SELECT 
          e.*,
          u.email as created_by_email,
          COALESCE(
            CONCAT(t2.first_name, ' ', t2.last_name),
            CONCAT(st.first_name, ' ', st.last_name),
            u.email
          ) as created_by_name
        FROM events e
        LEFT JOIN users u ON e.created_by = u.id
        LEFT JOIN teachers t2 ON u.id = t2.user_id
        LEFT JOIN staff st ON u.id = st.user_id
        WHERE e.is_active = 1 
          AND e.event_date >= CURDATE()
          AND (
            e.target_audience = 'all'
            OR e.target_audience = 'teachers'
            OR e.target_audience = 'staff'
          )
        ORDER BY e.event_date ASC, e.start_time ASC
      `;
    } else if (userRole === "student") {
      query = `
        SELECT 
          e.*,
          u.email as created_by_email,
          COALESCE(
            CONCAT(t.first_name, ' ', t.last_name),
            CONCAT(st.first_name, ' ', st.last_name),
            u.email
          ) as created_by_name
        FROM events e
        LEFT JOIN users u ON e.created_by = u.id
        LEFT JOIN teachers t ON u.id = t.user_id
        LEFT JOIN staff st ON u.id = st.user_id
        WHERE e.is_active = 1 
          AND e.event_date >= CURDATE()
          AND (
            e.target_audience = 'all'
            OR e.target_audience = 'students'
          )
        ORDER BY e.event_date ASC, e.start_time ASC
      `;
    } else if (userRole === "parent") {
      query = `
        SELECT 
          e.*,
          u.email as created_by_email,
          COALESCE(
            CONCAT(t.first_name, ' ', t.last_name),
            CONCAT(st.first_name, ' ', st.last_name),
            u.email
          ) as created_by_name
        FROM events e
        LEFT JOIN users u ON e.created_by = u.id
        LEFT JOIN teachers t ON u.id = t.user_id
        LEFT JOIN staff st ON u.id = st.user_id
        WHERE e.is_active = 1 
          AND e.event_date >= CURDATE()
          AND (
            e.target_audience = 'all'
            OR e.target_audience = 'parents'
          )
        ORDER BY e.event_date ASC, e.start_time ASC
      `;
    } else {
      // Default: only general events
      query = `
        SELECT 
          e.*,
          u.email as created_by_email,
          COALESCE(
            CONCAT(t.first_name, ' ', t.last_name),
            CONCAT(st.first_name, ' ', st.last_name),
            u.email
          ) as created_by_name
        FROM events e
        LEFT JOIN users u ON e.created_by = u.id
        LEFT JOIN teachers t ON u.id = t.user_id
        LEFT JOIN staff st ON u.id = st.user_id
        WHERE e.is_active = 1 
          AND e.event_date >= CURDATE()
          AND e.target_audience = 'all'
        ORDER BY e.event_date ASC, e.start_time ASC
      `;
    }

    const [events] = await pool.query(query, params);

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Get my events error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message,
    });
  }
};

// Get event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const [events] = await pool.query(
      `
      SELECT 
        e.*,
        u.email as created_by_email,
        COALESCE(
          CONCAT(t.first_name, ' ', t.last_name),
          CONCAT(st.first_name, ' ', st.last_name),
          u.email
        ) as created_by_name
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN teachers t ON u.id = t.user_id
      LEFT JOIN staff st ON u.id = st.user_id
      WHERE e.id = ?
    `,
      [id]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.json({
      success: true,
      data: events[0],
    });
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event",
      error: error.message,
    });
  }
};

// Create event
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      event_type,
      event_date,
      start_time,
      end_time,
      location,
      target_audience,
      is_holiday,
      is_active,
    } = req.body;

    const created_by = req.user.id;

    if (!title || !event_date) {
      return res.status(400).json({
        success: false,
        message: "Title and event date are required",
      });
    }

    // Validate target_audience
    const validAudiences = ["all", "students", "teachers", "parents", "staff"];
    const audience = target_audience || "all";
    if (!validAudiences.includes(audience)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target audience",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO events 
       (title, description, event_type, event_date, start_time, end_time, location, target_audience, is_holiday, created_by, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        event_type || null,
        event_date,
        start_time || null,
        end_time || null,
        location || null,
        audience,
        is_holiday ? 1 : 0,
        created_by,
        is_active !== undefined ? is_active : 1,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: {
        id: result.insertId,
        title,
        event_date,
        event_type,
        target_audience: audience,
        is_holiday: is_holiday ? 1 : 0,
        created_by,
      },
    });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create event",
      error: error.message,
    });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if event exists
    const [existing] = await pool.query(
      "SELECT id, created_by FROM events WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Validate target_audience if being updated
    if (updateData.target_audience) {
      const validAudiences = ["all", "students", "teachers", "parents", "staff"];
      if (!validAudiences.includes(updateData.target_audience)) {
        return res.status(400).json({
          success: false,
          message: "Invalid target audience",
        });
      }
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.created_by;
    delete updateData.created_at;

    const fields = Object.keys(updateData);
    const values = Object.values(updateData);

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    values.push(id);

    await pool.query(
      `UPDATE events SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: "Event updated successfully",
    });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update event",
      error: error.message,
    });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if event exists
    const [existing] = await pool.query(
      "SELECT id FROM events WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    await pool.query("DELETE FROM events WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete event",
      error: error.message,
    });
  }
};

// Toggle event status (activate/deactivate)
const toggleEventStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if event exists and get current status
    const [existing] = await pool.query(
      "SELECT id, is_active FROM events WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const newStatus = existing[0].is_active ? 0 : 1;

    await pool.query(
      "UPDATE events SET is_active = ?, updated_at = NOW() WHERE id = ?",
      [newStatus, id]
    );

    res.json({
      success: true,
      message: `Event ${newStatus ? "activated" : "deactivated"} successfully`,
      data: {
        id,
        is_active: newStatus,
      },
    });
  } catch (error) {
    console.error("Toggle event status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle event status",
      error: error.message,
    });
  }
};

// Get upcoming events
const getUpcomingEvents = async (req, res) => {
  try {
    const { limit } = req.query;

    let query = `
      SELECT 
        e.*,
        u.email as created_by_email,
        COALESCE(
          CONCAT(t.first_name, ' ', t.last_name),
          CONCAT(st.first_name, ' ', st.last_name),
          u.email
        ) as created_by_name
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN teachers t ON u.id = t.user_id
      LEFT JOIN staff st ON u.id = st.user_id
      WHERE e.is_active = 1 
        AND e.event_date >= CURDATE()
      ORDER BY e.event_date ASC, e.start_time ASC
    `;

    if (limit) {
      query += ` LIMIT ?`;
    }

    const params = limit ? [parseInt(limit)] : [];
    const [events] = await pool.query(query, params);

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Get upcoming events error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming events",
      error: error.message,
    });
  }
};

// Get today's events
const getTodayEvents = async (req, res) => {
  try {
    const [events] = await pool.query(
      `
      SELECT 
        e.*,
        u.email as created_by_email,
        COALESCE(
          CONCAT(t.first_name, ' ', t.last_name),
          CONCAT(st.first_name, ' ', st.last_name),
          u.email
        ) as created_by_name
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN teachers t ON u.id = t.user_id
      LEFT JOIN staff st ON u.id = st.user_id
      WHERE e.is_active = 1 
        AND e.event_date = CURDATE()
      ORDER BY e.start_time ASC
    `
    );

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Get today events error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch today's events",
      error: error.message,
    });
  }
};

// Get holidays
const getHolidays = async (req, res) => {
  try {
    const { year } = req.query;

    let query = `
      SELECT 
        e.*,
        u.email as created_by_email,
        COALESCE(
          CONCAT(t.first_name, ' ', t.last_name),
          CONCAT(st.first_name, ' ', st.last_name),
          u.email
        ) as created_by_name
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN teachers t ON u.id = t.user_id
      LEFT JOIN staff st ON u.id = st.user_id
      WHERE e.is_holiday = 1 
        AND e.is_active = 1
    `;

    const params = [];

    if (year) {
      query += " AND YEAR(e.event_date) = ?";
      params.push(year);
    }

    query += " ORDER BY e.event_date ASC";

    const [events] = await pool.query(query, params);

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Get holidays error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch holidays",
      error: error.message,
    });
  }
};

// Get events by type
const getEventsByType = async (req, res) => {
  try {
    const { event_type } = req.params;

    const [events] = await pool.query(
      `
      SELECT 
        e.*,
        u.email as created_by_email,
        COALESCE(
          CONCAT(t.first_name, ' ', t.last_name),
          CONCAT(st.first_name, ' ', st.last_name),
          u.email
        ) as created_by_name
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN teachers t ON u.id = t.user_id
      LEFT JOIN staff st ON u.id = st.user_id
      WHERE e.event_type = ? 
        AND e.is_active = 1
      ORDER BY e.event_date ASC, e.start_time ASC
    `,
      [event_type]
    );

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Get events by type error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message,
    });
  }
};

// Get events by date range
const getEventsByDateRange = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const [events] = await pool.query(
      `
      SELECT 
        e.*,
        u.email as created_by_email,
        COALESCE(
          CONCAT(t.first_name, ' ', t.last_name),
          CONCAT(st.first_name, ' ', st.last_name),
          u.email
        ) as created_by_name
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN teachers t ON u.id = t.user_id
      LEFT JOIN staff st ON u.id = st.user_id
      WHERE e.event_date BETWEEN ? AND ?
        AND e.is_active = 1
      ORDER BY e.event_date ASC, e.start_time ASC
    `,
      [start_date, end_date]
    );

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Get events by date range error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message,
    });
  }
};

// Get events created by logged-in user
const getMyCreatedEvents = async (req, res) => {
  try {
    const userId = req.user.id;

    const [events] = await pool.query(
      `
      SELECT 
        e.*
      FROM events e
      WHERE e.created_by = ?
      ORDER BY e.event_date DESC, e.id DESC
    `,
      [userId]
    );

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Get my created events error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message,
    });
  }
};

// Get events for calendar (month view)
const getCalendarEvents = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required",
      });
    }

    const [events] = await pool.query(
      `
      SELECT 
        e.*,
        u.email as created_by_email,
        COALESCE(
          CONCAT(t.first_name, ' ', t.last_name),
          CONCAT(st.first_name, ' ', st.last_name),
          u.email
        ) as created_by_name
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN teachers t ON u.id = t.user_id
      LEFT JOIN staff st ON u.id = st.user_id
      WHERE MONTH(e.event_date) = ? 
        AND YEAR(e.event_date) = ?
        AND e.is_active = 1
      ORDER BY e.event_date ASC, e.start_time ASC
    `,
      [month, year]
    );

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Get calendar events error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch calendar events",
      error: error.message,
    });
  }
};

module.exports = {
  getAllEvents,
  getMyEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventStatus,
  getUpcomingEvents,
  getTodayEvents,
  getHolidays,
  getEventsByType,
  getEventsByDateRange,
  getMyCreatedEvents,
  getCalendarEvents,
};