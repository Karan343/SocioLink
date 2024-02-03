import User from "../models/User.js";

/* READ */
export const getUser = async (req, res, next) => {
  try {
    // Extract the 'id' parameter from the request URL
    const { id } = req.params;
    // Find a user in the database by their ID
    const user = await User.findById(id);
    if (!user) {
      // If a user with the specified ID is not found, respond with a 404 Not Found status and an error message
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getUserFriends = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      // If a user with the specified ID is not found, respond with a 404 Not Found status and an error message
      return res.status(404).json({ message: "User not found." });
    }
    /*
    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    ); or with this way using the loop
          const resolvedFriends = [];
          for (const id of user.friends) {
         const friend = await User.findById(id);
         resolvedFriends.push(friend);}*/
    //this is more effiecient way
    /* It essentially filters the documents in the collection to find those whose _id values match any of the values in the user.friends array. */
    const friends = await User.find({ _id: { $in: user.friends } });
    const formattedFriends = friends.map((friend) => ({
      _id: friend._id,
      firstName: friend.firstName,
      lastName: friend.lastName,
      occupation: friend.occupation,
      location: friend.location,
      picturePath: friend.picturePath,
    }));

    return res.status(200).json(formattedFriends);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

/* UPDATE */
export const addRemoveFriends = async (req, res, next) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);
    if (!user || !friend) {
      // If either the user or friend is not found, respond with a 404 Not Found status and an error message
      return res.status(404).json({ message: "User or friend not found." });
    }
    if (user.friends.includes(friendId)) {
      // Check if the friend is already in the user's friends list
      // If yes, remove the friend from the user's friends list and vice versaq
      user.friends = user.friends.filter((id) => id !== friendId);
      friend.friends = friend.friends.filter((Id) => Id !== id);
    } else {
      // If not, add the friend to the user's friends list and vice versa
      user.friends.push(friendId);
      friend.friends.push(id);
    }
    // Save the changes to both the user and friend documents
    await user.save();
    await friend.save();
    // Retrieve the user's updated list of friends
    const friends = await User.find({ _id: { $in: user.friends } });

    const formattedFriends = friends.map((friend) => ({
      _id: friend._id,
      firstName: friend.firstName,
      lastName: friend.lastName,
      occupation: friend.occupation,
      location: friend.location,
      picturePath: friend.picturePath,
    }));

    return res.status(200).json(formattedFriends);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
