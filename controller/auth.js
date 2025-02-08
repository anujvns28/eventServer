const User = require("../models/user");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");




// signup
exports.signUp = async (req, res) => {
    try {
      //fetchin data
      const { name,  password, email } = req.body;

    //   console.log(req,"this is file")
  
      const avatar = req.files.profileImage;
  
      if (!name ||  !password || !email || !avatar) {
        return res.status(403).send({
          success: false,
          message: "All Fields are required",
        });
      }
  
      // Check if user already exists
      const existingUser = await User.findOne({ email:email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "username already exists. Please sign in to continue.",
        });
      }
      const avatarUrl = await uploadImageToCloudinary(avatar);

      console.log(avatarUrl,"this is avtar url")
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const user = await User.create({
        name,
        password: hashedPassword,
        email: email,
        bio: null,
        profileImage: avatarUrl.secure_url,
      });
  
      const token = jwt.sign(
        { email:email, _id: user._id },
        process.env.JWT_SECRET
      );
  
      user.token = token;
  
      return res.cookie("token", token).status(200).json({
        success: true,
        user,
        token,
        message: "User registered successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Error occerured in Signup form",
      });
    }
  };
  
  exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if email or password is missing
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: `Please Fill up All the Required Fields`,
        });
      }
  
      // Find user with provided email
      const user = await User.findOne({email:email }).select("+password");
  
      // If user not found with provided email
      if (!user) {
        return res.status(401).json({
          success: false,
          message: `User is not Registered with Us Please SignUp to Continue`,
        });
      }
  
      //  Compare Password
      if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign(
          { email:email, _id: user._id },
          process.env.JWT_SECRET
        );
  
        res.cookie("token", token).status(200).json({
          success: true,
          user,
          token,
          message: `User Login Success`,
        });
      } else {
        return res.status(401).json({
          success: false,
          message: `Password is incorrect`,
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: `Login Failure Please Try Again`,
      });
    }
  };
  
  exports.logout = (req, res) => {
    const options = {
      expires: 0,
    };
  
    return res.cookie("token", "", options).status(200).json({
      success: false,
      message: "logout successfully",
    });
  };