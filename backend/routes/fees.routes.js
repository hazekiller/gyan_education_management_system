const express = require("express");
const router = express.Router();
const feesController = require("../controllers/feesController");

// Fee Heads
router.post("/heads", feesController.createFeeHead);
router.get("/heads", feesController.getFeeHeads);

// Fee Structure
router.post("/structure", feesController.createFeeStructure);
router.get("/structure", feesController.getFeeStructure);

// Student Fees & Collection
router.get("/student/:student_id", feesController.getStudentFeeStatus);
router.post("/collect", feesController.collectFee);
router.get("/payments", feesController.getPayments);

module.exports = router;
