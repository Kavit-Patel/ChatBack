import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    img: { type: String, default: "" },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    friends: [],
  },
  { timestamps: true }
);

export const userModel = mongoose.model("user", userSchema);
