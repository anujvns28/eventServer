const express = require("express");
const router = express.Router();
const { getUserEvents } = require("../controller/user");
const { auth } = require("../middleware/auth");

// Route to get user events
router.post("/user_events", auth, getUserEvents); 

module.exports = router;
