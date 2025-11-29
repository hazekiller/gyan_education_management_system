const express = require("express");
const router = express.Router();
const payrollController = require("../controllers/payrollController");
const { authorize } = require("../middleware/auth");

// All routes require admin or accountant role (adjust roles as needed)
// Assuming 'super_admin', 'principal', 'accountant' can manage payroll
const allowedRoles = ['super_admin', 'principal', 'vice_principal', 'accountant'];

router.get("/", authorize(allowedRoles), payrollController.getAllPayrollRecords);
router.get("/:id", authorize(allowedRoles), payrollController.getPayrollById);
router.post("/", authorize(allowedRoles), payrollController.createPayrollRecord);
router.put("/:id", authorize(allowedRoles), payrollController.updatePayrollRecord);
router.delete("/:id", authorize(allowedRoles), payrollController.deletePayrollRecord);
router.get("/employee/:type/:id", authorize(allowedRoles.concat(['teacher', 'staff', 'guard', 'cleaner', 'hod'])), payrollController.getEmployeePayroll);

module.exports = router;
