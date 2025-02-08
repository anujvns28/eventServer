const Event = require("../models/event");
const User = require("../models/user")
const { uploadImageToCloudinary } = require("../utils/imageUploader");


exports.createEvent = async (req, res) => {
  try {
    const { eventName, description, date, time, location, googleMeetLink, isOnline, category } = req.body;

    const eventImage = req.files.eventImage;

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized! Please log in." });
    }

    // Validate required fields
    if (!eventName || !description || !date || !time || !category) {
      return res.status(400).json({ message: "All required fields must be filled!" });
    }

    
    if (isOnline === "online" && !googleMeetLink) {
      return res.status(400).json({ message: "Google Meet link is required for online events!" });
    }

    if (isOnline === "offline" && !location) {
      return res.status(400).json({ message: "Location is required for offline events!" });
    }

    //uloading event image
    const eventImageUrl = await uploadImageToCloudinary(eventImage);

    // Create new event object
    const newEvent = new Event({
      title:eventName,
      description,
      date,
      time,
      location: isOnline === "offline" ? location : null, 
      googleMeetLink: isOnline === "online" ? googleMeetLink : null, 
      isOnline,
      category,
      image:eventImageUrl.secure_url,
      creator: req.userId,
    });

    // Save the event to the database
    await newEvent.save();
    res.status(201).json({ message: "Event created successfully!", event: newEvent });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//  Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("creator", "name email");
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//  Get a single event by ID
exports.getEventById = async (req, res) => {
  try {
    console.log(req.body)
    const event = await Event.findById(req.body.eventId).populate("creator", "name email profileImage");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//  Update an event
exports.updateEvent = async (req, res) => {
  try {
    const { eventName, description, date, time, location, googleMeetLink, isOnline, category, eventImage } = req.body;
    const event = await Event.findById(req.body.eventId);

    

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Ensure only the event creator can update
    if (event.creator.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "You can only update your own event" });
    }

    event.title = eventName || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.time = time || event.time;
    event.location = isOnline === "offline" ? location : event.location;
    event.googleMeetLink = isOnline === "online" ? googleMeetLink : event.googleMeetLink;
    event.isOnline = isOnline || event.isOnline;
    event.category = category || event.category;
    event.eventImage = eventImage || event.eventImage;

    await event.save();
    res.status(200).json({ message: "Event updated successfully", event });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.body.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Ensure only the event creator can delete
    if (event.creator.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "You can only delete your own event" });
    }

    await Event.findByIdAndDelete(event._id);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.participateInEvent = async (req, res) => {
    try {
      const { eventId } = req.body;
      const userId = req.userId;

      console.log(req.body,"this is evend ")
  
      // Check if event exists
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
  
      // Check if user is already a participant
      if (event.participants.includes(userId)) {
        return res.status(400).json({ message: "You are already registered for this event" });
      }
  
      // Add user to participants list
      event.participants.push(userId);
      await event.save();
  

      await User.findByIdAndUpdate(userId, { $push: { eventsParticipated: eventId } });
  
      return res.status(200).json({ message: "Successfully registered for the event", event });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };


  
// Controller to get the top 5 events
exports.getTopFiveEvents = async (req, res) => {
  try {
    
    const events = await Event.find()
      .sort({ participants: -1 }) 
      .limit(5); 

    if (!events) {
      return res.status(404).json({ message: "No events found" });
    }

    // Return the events to the client
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching top events:", error);
    res.status(500).json({ message: "Server error while fetching events" });
  }
};



