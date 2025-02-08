const User = require("../models/user"); 
const Event = require("../models/event"); 


const getUserEvents = async (req, res) => {
  try {
    
    const userId = req.userId; 

    const user = await User.findById(userId)
      .populate("eventsParticipated"); 

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const events = await Event.find({ creator: userId })
      .populate("participants", "name email") 
      .exec();


    
    return res.status(200).json({
      name: user.name,
      email: user.email,
      eventsCreated: events, 
      eventsParticipated: user.eventsParticipated, 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getUserEvents };
