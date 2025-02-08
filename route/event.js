const express = require("express");
const { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent,participateInEvent, getTopFiveEvents } = require("../controller/events");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Public Routes
router.get("/getAllEvents", getAllEvents);
router.post("/getEvent", getEventById);
router.get("/getTopFiveEvents",getTopFiveEvents)

// Protected Routes (Require Authentication)
router.post("/createEvent", auth, createEvent);
router.post("/updateEvent", auth, updateEvent);
router.post("/deleteEvent", auth, deleteEvent);
router.post("/participateInEvent",auth,participateInEvent)

module.exports = router;
