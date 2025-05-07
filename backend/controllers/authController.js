import User from '../models/users.js';
import RegisterDTO from '../Dtos/registerDto.js';
import LoginDTO from '../Dtos/loginDto.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Register user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Registration failed', 
        error: 'Name, email, and password are required' 
      });
    }

    const userDTO = new RegisterDTO(name, email, password, address, phone);
    const existingUser = await User.findOne({ email: userDTO.email });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(userDTO.password, 10);
    const user = new User({
      name: userDTO.name,
      email: userDTO.email,
      password: hashedPassword,
      address: userDTO.address,
      phone: userDTO.phone,
    });

    await user.save();
    
    // Omit password in response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({ 
      message: 'User registered successfully', 
      user: userResponse 
    });
  } catch (error) {
    res.status(400).json({ 
      message: 'Registration failed', 
      error: error.message 
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    console.log('Request body:', req.body); // Debugging
    
    // Validate request body
    if (!req.body || !req.body.email || !req.body.password) {
      return res.status(400).json({ 
        message: 'Login failed', 
        error: 'Email and password are required' 
      });
    }

    const { email, password } = req.body;
    
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        message: 'Login failed', 
        error: 'Invalid email format' 
      });
    }

    const loginDTO = new LoginDTO(email, password);
    const user = await User.findOne({ email: loginDTO.email }).select('+password');
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(loginDTO.password, user.password);
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
    console.error('Login error:', error); // Debugging
    res.status(500).json({ 
      message: 'Login failed', 
      error: error.message 
    });
  }
};