import User from '../models/users.js';
import RegisterDTO from '../Dtos/registerDto.js';
import LoginDTO from '../Dtos/loginDto.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Register user and auto-login
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Registration failed',
        error: 'Name, email, and password are required',
      });
    }

    const userDTO = new RegisterDTO(
      name.trim(),
      email.trim().toLowerCase(),
      password,
      address,
      phone
    );

    const existingUser = await User.findOne({ email: userDTO.email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      name: userDTO.name,
      email: userDTO.email,
      password: userDTO.password,
      address: userDTO.address,
      phone: userDTO.phone,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'User registered and logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Registration failed',
      error: error.message,
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    if (!req.body || !req.body.email || !req.body.password) {
      return res.status(400).json({
        message: 'Login failed',
        error: 'Email and password are required',
      });
    }

    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;
    const loginDTO = new LoginDTO(email, password);

    const user = await User.findOne({ email: loginDTO.email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Use comparePassword method from the schema (optional)
    const isMatch = await user.comparePassword(loginDTO.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Login failed',
      error: error.message,
    });
  }
};
