const express = require("express");
const router = express.Router();
const payrollController = require("../controllers/payrollController");
const { authenticate } = require("../middleware/auth");

// All routes require authentication
router.use(authenticate);

router.get("/", authenticate, payrollController.getAllPayrollRecords);
router.get("/:id", authenticate, payrollController.getPayrollById);
router.post("/", authenticate, payrollController.createPayrollRecord);
router.put("/:id", authenticate, payrollController.updatePayrollRecord);
router.delete("/:id", authenticate, payrollController.deletePayrollRecord);
router.get("/employee/:type/:id", authenticate, payrollController.getEmployeePayroll);

module.exports = router;
