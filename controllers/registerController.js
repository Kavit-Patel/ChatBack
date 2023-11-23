// import { restart } from "nodemon";
import { chatModel } from "../models/chat.js";
import { userModel } from "../models/registration.js";
import jwt from "jsonwebtoken";

export const authController = async (req, res, next) => {
  // console.log(req.cookies);
  const { chat_basic_cookie } = req.cookies;
  try {
    if (!chat_basic_cookie) return;
    const user_id = jwt.verify(chat_basic_cookie, process.env.JSON_SECRATE);
    // console.log(user_id.id);
    const user = await userModel.findById(user_id.id);
    // console.log("user", user);
    if (!user) return res.status(403).json({ message: "User not exists" });
    req.body.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(403).json({ error: error });
  }
};
export const startCall = async (req, res) => {
  try {
    const { user } = req.body;
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: error });
  }
};

export const registerController = async (req, res) => {
  // console.log(req.body);
  const { user } = req.body;
  try {
    const newUser = await userModel.create({
      name: user.name,
      email: user.email,
      password: user.password,
    });
    // const savedUser = await newUser.save();
    return res.json({
      message: "User Registration successfull",
      data: newUser,
    });
  } catch (error) {
    console.log(error);
    return res.json({ error: error });
  }
};

export const loginController = async (req, res) => {
  const { user } = req.body;
  try {
    const membs = await userModel.find({});
    const checkUser = await userModel.findOne({ email: user.email });
    if (!checkUser)
      return res.status(403).json({ message: "User doesnot exist" });
    const matchPassword = checkUser.password == user.password;
    if (!matchPassword)
      return res.status(403).json({ message: "Password doesn't match" });
    const token = jwt.sign({ id: checkUser._id }, process.env.JSON_SECRATE, {
      expiresIn: "96h",
    });

    return res
      .cookie("chat_basic_cookie", token, {
        // sameSite: "none",
        // secure: "true",
        // httpOnly: true,

        expires: new Date(Date.now() + 9000000),
        // expiresIn:'48h'
      })
      .json({ user: checkUser, members: membs })
      .status(200);
  } catch (error) {
    return res.status(404).json({ error: error });
  }
};

// export const me = async (req, res) => {};

export const members = async (req, res) => {
  try {
    // console.log(req.body.user);
    const membs = await userModel.find({});
    // console.log(membs);
    return res.json(membs).status(200);
  } catch (error) {
    console.log("error", error);
    return res.json({ error: error });
  }
};

export const chat = async (req, res) => {
  const { admin, other, adminText } = req.body;
  try {
    const chattings = await chatModel.findOne({
      "parties.admin": {
        $in: [admin.name, other.name],
      },
      "parties.other": {
        $in: [admin.name, other.name],
      },
    });
    // console.log("chattings", chattings);
    if (chattings) {
      const friendCheck = await userModel.findOne(
        { _id: admin._id }
        // {
        //   friends: { $elemMatch: { _id: other._id } },
        // }
      );
      // console.log(
      //   friendCheck.friends.some((friend) => friend._id == other._id)
      // );
      // console.log("fcheck", friendCheck);
      if (!friendCheck.friends.some((friend) => friend._id == other._id)) {
        // console.log("not empty friendcheck");
        // console.log(other);
        const addFriend = await userModel.findByIdAndUpdate(admin._id, {
          $push: { friends: other },
        });
      }
      if (adminText?.length > 0) {
        // console.log(adminText);
        const newMessage = await chatModel.findByIdAndUpdate(chattings._id, {
          $push: {
            messages: {
              senderText: adminText,
              sender: admin.name,
              receiver: other.name,
            },
          },
        });
      }
      const savedChattings = await chatModel.findById(chattings._id);
      return res.json(savedChattings).status(200);
    } else {
      // console.log("else");
      const friendCheck = await userModel.findOne({
        _id: admin._id,
      });
      // console.log("first time -fcheck", friendCheck);
      if (!friendCheck.friends.some((friend) => friend._id == other._id)) {
        // console.log("not empty friendcheck");
        // console.log(other);
        const addFriend = await userModel.findByIdAndUpdate(admin._id, {
          $push: { friends: other },
        });
      }
      const newChatting = await chatModel.create({
        parties: { admin: admin.name, other: other.name },
      });
      return res.json(newChatting).status(200);
    }
  } catch (error) {
    console.log(error);
    return res.json({ error: error });
  }
};
export const myFriend = async (req, res) => {
  const { user } = req.body;
  // console.log(user);
  try {
    const friends = user.friends;
    // console.log(friends);
    return res.status(200).json(friends);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: error });
  }
};
