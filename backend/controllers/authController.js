const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Get user
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact administrator.",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login
    await pool.query("UPDATE users SET last_login = NOW() WHERE id = ?", [
      user.id,
    ]);

    // Get user details based on role
    let userDetails = null;

    if (user.role === "student") {
      const [students] = await pool.query(
        `SELECT s.*, c.name as class_name, sec.name as section_name 
         FROM students s 
         LEFT JOIN classes c ON s.class_id = c.id 
         LEFT JOIN sections sec ON s.section_id = sec.id 
         WHERE s.user_id = ?`,
        [user.id]
      );
      userDetails = students[0];
    } else if (user.role === "teacher") {
      const [teachers] = await pool.query(
        "SELECT * FROM teachers WHERE user_id = ?",
        [user.id]
      );
      userDetails = teachers[0];
    } else if (["accountant", "guard", "cleaner"].includes(user.role)) {
      const [staff] = await pool.query(
        "SELECT * FROM staff WHERE user_id = ?",
        [user.id]
      );
      userDetails = staff[0];
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          details: userDetails,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let userDetails = null;

    if (role === "student") {
      // Get student ID from user_id
      const [studentIds] = await pool.query(
        "SELECT id FROM students WHERE user_id = ?",
        [userId]
      );

      if (studentIds.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }

      const studentId = studentIds[0].id;

      // Use the SAME unified query as admin view for 100% data parity
      const [students] = await pool.query(
        `SELECT 
          s.*,
          c.name as class_name,
          c.grade_level,
          sec.name as section_name,
          u.email,
          u.phone_number as user_phone,
          u.profile_photo as user_profile_photo,
          u.is_active as account_active,
          u.role as account_role,
          u.last_login,
          u.created_at as account_created_at
        FROM students s
        LEFT JOIN classes c ON s.class_id = c.id
        LEFT JOIN sections sec ON s.section_id = sec.id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.id = ?`,
        [studentId]
      );

      userDetails = students[0];
    } else if (role === "teacher") {
      const [teachers] = await pool.query(
        "SELECT t.*, u.email FROM teachers t LEFT JOIN users u ON t.user_id = u.id WHERE t.user_id = ?",
        [userId]
      );
      userDetails = teachers[0];
    } else if (["accountant", "guard", "cleaner"].includes(role)) {
      const [staff] = await pool.query(
        "SELECT s.*, u.email FROM staff s LEFT JOIN users u ON s.user_id = u.id WHERE s.user_id = ?",
        [userId]
      );
      userDetails = staff[0];
    } else {
      // For management and super admin
      const [users] = await pool.query(
        "SELECT id, email, role, is_active, last_login, created_at FROM users WHERE id = ?",
        [userId]
      );
      userDetails = users[0];
    }

    res.json({
      success: true,
      data: {
        role,
        profile: userDetails,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Get current password
    const [users] = await pool.query(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      users[0].password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};

module.exports = {
  login,
  getProfile,
  changePassword,
  logout,
};
