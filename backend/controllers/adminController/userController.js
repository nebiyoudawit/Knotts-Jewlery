import User from '../../models/users.js';
import redisClient from '../../utils/redisClient.js';
import { invalidateDashboardCache, invalidateAdminUserList, invalidateAdminOrderList } from '../../utils/cacheUtils.js';

// GET ALL USERS
export const getUsers = async (req, res) => {
  const cacheKey = 'admin:users';
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const users = await User.find().select('-password');
    await redisClient.setEx(cacheKey, 300, JSON.stringify(users));

    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

// ADD NEW USER
export const addUser = async (req, res) => {
  try {
    const { name, email, password, role, address, phone } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'User already exists' });

    const newUser = await User.create({ name, email, password, role, address, phone });

    await invalidateDashboardCache(); 
    await invalidateAdminUserList();

    const { password: _, ...userData } = newUser.toObject();
    res.status(201).json({ success: true, user: userData });
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(400).json({ success: false, message: 'Invalid user data', error: err.message });
  }
};

// DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    await invalidateDashboardCache();
    await invalidateAdminUserList();
    
    res.json({ 
      success: true,
      message: 'User deleted successfully' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete user',
      error: err.message 
    });
  }
};

// UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, address, phone } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.name = name;
    user.email = email;
    user.role = role;
    user.address = address;
    user.phone = phone;
    await user.save();
    
    await invalidateAdminUserList();
    await invalidateAdminOrderList();
    await invalidateDashboardCache();
    
    const { password: _, ...userData } = user.toObject();
    res.json({ success: true, user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update user', error: err.message });
  }
};