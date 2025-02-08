const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { dbConnection } = require("./config/dbConnect");
const { cloudinaryConnect } = require("./config/cloudnary");
const authRoutes = require("./route/auth");
const eventRoutes = require("./route/event");
const userRoutes = require("./route/user");
const fileUpload = require("express-fileupload");

const { Server } = require("socket.io");
const { createServer } = require("http");

const app = express();
const server = createServer(app); // ✅ Correctly create an HTTP server

// Enable CORS with credentials
app.use(
  cors({
    origin: "https://eventify-taupe.vercel.app/",
    credentials: true,
  })
);

// Middleware for JSON & Form Data Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File Upload Middleware
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Mounting Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/event", eventRoutes);
app.use("/api/v1/user", userRoutes);

// Connect to Database & Cloudinary
dbConnection();
cloudinaryConnect();

// Initialize socket.io with CORS configuration
const io = new Server(server, {
  cors: {
    origin: "https://eventify-taupe.vercel.app/",
    methods: ["GET", "POST"],
  },
});

// Socket.io event handling
io.on("connection", (socket) => {
  console.log(`New user connected: ${socket.id}`);

  socket.on("sendMessage", (message) => {
    console.log("Received message:", message);
    io.emit("message", message); // Broadcast to all clients
  });

  socket.on("participate",(data)=>{
      io.emit("addUser",{eventId:data.eventId,userId:data.userId})
      console.log("add user emited")
  })

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start the Server (✅ Use `server.listen()` instead of `app.listen()`)
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
