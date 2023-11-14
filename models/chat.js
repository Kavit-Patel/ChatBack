import mongoose from "mongoose";

// const chatterSchema = new mongoose.Schema();
const chatSchema = new mongoose.Schema({
  parties: [{ admin: String, other: String }],
  messages: [
    {
      sender: String,
      receiver: String,
      senderText: String,
    },
  ],
});
export const chatModel = mongoose.model("chat", chatSchema);
