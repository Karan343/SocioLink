import Post from "../models/Post.js";
import User from "../models/User.js";
/* CREATE */

export const createPost = async (req, res, next) => {
  try {
    const { userId, description, picturePath } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      // If the user does not exist, respond with a 404 Not Found status and an error message
      return res.status(404).json({ message: "User not found." });
    }
    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath,
      likes: {},
      comments: [],
    });
    // Save the new post document
    await newPost.save();
    const post = await Post.find();
    return res.status(201).json(post);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

/* READ */
export const getFeedPosts = async (req, res, next) => {
  try {
    // Fetch all posts
    const posts = await Post.find();
    return res.status(200).json(posts);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getUserPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    // Fetch posts for the specific user
    const posts = await Post.find({ userId });
    // Respond with a 200 OK status and the list of user's posts
    return res.status(200).json(posts);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

/* UPDATE */
export const likePost = async (req, res, next) => {
  try {
    const { id } = req.params; //id of a post
    const { userId } = req.body;
    const post = await Post.findById(id);
    // Check if the post exists
    if (!post) {
      // If the post is not found, respond with a 404 Not Found status and a message
      return res.status(404).json({ message: "Post not found." });
    }
    const isLiked = post.likes.get(userId);
    if (isLiked) {
      // If the user has already liked the post, remove the like
      post.likes.delete(userId);
    } else {
      // If the user hasn't liked the post, add the like
      post.likes.set(userId, true);
    }
    const updatedPost = await post.save();
   /*you can also do like this here { new: true } ensures that updatedPost will contain the updated document with the latest likes field values.
    const updatedPost = await Post.findByIdAndUpdate( 
      id,
      { likes: post.likes },
      { new: true }
    );*/
    return res.status(200).json(updatedPost);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
