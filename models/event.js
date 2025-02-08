const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
      match: [/^([0-9]{2}):([0-9]{2})$/, "Time must be in HH:MM format"],
    },
    location: {
      type: String,
    },
    category:{
      type:String,
      required:true
    },
    googleMeetLink:{
      type:String,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    image: {
      type: String, // URL for event image
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isOnline:{
      type:String,
      required:true
    }
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", EventSchema);
module.exports = Event;
