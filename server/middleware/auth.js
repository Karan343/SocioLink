import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  try {
    // Get the Authorization header from the request
    let authHeader = req.header("Authorization");

    // If there's no Authorization header or it doesn't start with "Bearer ", respond with a 403 Forbidden status
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).send("Access Denied");
    }
    // Extract the token part (removing "Bearer " from the header)
    const token = authHeader.slice(7).trim();

    // Verify the JWT token using the JWT_SECRET from environment variables
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the verified user information (from the token) to the request object
    req.user = verified;
    next(); // Move to the next middleware or route handler
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
