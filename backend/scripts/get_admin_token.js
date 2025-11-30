require("dotenv").config();
const jwt = require("jsonwebtoken");

const userId = 1;
const role = "super_admin";
const secret = process.env.JWT_SECRET;

if (!secret) {
  console.error("JWT_SECRET not found");
  process.exit(1);
}

const token = jwt.sign({ id: userId, role: role }, secret, { expiresIn: "1h" });
console.log(token);
