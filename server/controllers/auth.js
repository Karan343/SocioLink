import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* REGISTER USER */
export const register = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends,
      location,
      occupation,
    } = req.body;
    //  Salting passwords enhances security by ensuring that identical passwords will have different hashes due to the unique salt.
    const salt = await bcrypt.genSalt();
    // Hash the user's password with the generated salt
    const passwordHash = await bcrypt.hash(password, salt);

    // Create a new User model with the user's data and hashed password
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash, // Store the hashed password in the database
      picturePath,
      friends,
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });
    const savedUser = await newUser.save();
   return res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* LOGGING IN */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      // If user does not exist, respond with a 400 Bad Request status and a message
      return res.status(400).json({ msg: "User does not exist. " });
    }
    // Compare the provided password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // If the passwords don't match, respond with a 400 Bad Request status and a message
      return res.status(400).json({ msg: "Invalid credentials. " });
    }
    // If the user exists and the password is correct, generate a JWT (JSON Web Token)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    // Exclude sensitive information (like the password) from the user object
    const { password: userPassword, ...userWithoutPassword } = user.toObject();

    // Respond with a 200 OK status, the JWT token, and the user object
    return res.status(200).json({ token, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
