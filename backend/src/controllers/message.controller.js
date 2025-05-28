// controllers/message.controller.js
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    console.log("🔍 Getting users for sidebar");
    console.log("👤 Logged in user ID:", req.user._id);
    
    const loggedInUserId = req.user._id;
    
    // Find all users except the logged-in user
    const filteredUsers = await User.find({ 
      _id: { $ne: loggedInUserId } 
    }).select("-password");
    
    console.log("✅ Found", filteredUsers.length, "users for sidebar");
    res.status(200).json(filteredUsers);
    
  } catch (error) {
    console.error("❌ Error in getUsersForSidebar:", error.message);
    res.status(500).json({ 
      error: "Internal server error",
      message: "Failed to fetch users"
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    console.log("💬 Getting messages between:", myId, "and", userToChatId);

    if (!userToChatId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 }); // Sort by creation time

    console.log("✅ Found", messages.length, "messages");
    res.status(200).json(messages);
    
  } catch (error) {
    console.log("❌ Error in getMessages controller:", error.message);
    res.status(500).json({ 
      error: "Internal server error",
      message: "Failed to fetch messages"
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    console.log("📤 Sending message from:", senderId, "to:", receiverId);

    if (!receiverId) {
      return res.status(400).json({ error: "Receiver ID is required" });
    }

    if (!text && !image) {
      return res.status(400).json({ error: "Message text or image is required" });
    }

    let imageUrl;
    if (image) {
      console.log("📸 Uploading image to cloudinary...");
      try {
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
        console.log("✅ Image uploaded successfully");
      } catch (uploadError) {
        console.error("❌ Image upload failed:", uploadError);
        return res.status(400).json({ error: "Failed to upload image" });
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();
    console.log("✅ Message saved to database");

    // Send real-time message via socket
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      console.log("📡 Sending real-time message to:", receiverId);
      io.to(receiverSocketId).emit("newMessage", newMessage);
    } else {
      console.log("📴 Receiver not online:", receiverId);
    }

    res.status(201).json(newMessage);
    
  } catch (error) {
    console.log("❌ Error in sendMessage controller:", error.message);
    res.status(500).json({ 
      error: "Internal server error",
      message: "Failed to send message"
    });
  }
};