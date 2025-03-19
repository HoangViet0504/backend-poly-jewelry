const User = require("../models/userModel");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = await User.createUser(name, email);
    res.status(201).json({ id: userId, name, email });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = { getAllUsers, createUser };
