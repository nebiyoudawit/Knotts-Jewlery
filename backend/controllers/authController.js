import User from '../models/users.js';
import RegisterDTO from '../Dtos/registerDto.js';
import LoginDTO from '../Dtos/loginDto.js';
import jwt from 'jsonwebtoken';
import { normalizePhone, phoneFilter } from '../utils/phone.js';
import { invalidateDashboardCache, invalidateAdminUserList} from '../utils/cacheUtils.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Register user and auto-login
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;
    const phone = normalizePhone(req.body.phone);

    if (!name || !password || !phone) {
      return res.status(400).json({
        message: !phone && req.body.phone ? 'Enter a valid Ethiopian phone number' : 'Name, phone number and password are required',
      });
    }

    const userDTO = new RegisterDTO(
      name.trim(),
      email?.trim() ? email.trim().toLowerCase() : undefined,
      password,
      address,
      phone
    );

    if (await User.exists(phoneFilter(phone))) {
      return res.status(400).json({ message: 'An account with this phone number already exists. Log in instead.' });
    }
    if (userDTO.email && (await User.exists({ email: userDTO.email }))) {
      return res.status(400).json({ message: 'An account with this email already exists. Log in instead.' });
    }

    const user = new User({
      name: userDTO.name,
      email: userDTO.email,
      password: userDTO.password,
      address: userDTO.address,
      phone: userDTO.phone,
    });

    await user.save();
    await invalidateDashboardCache(); // Invalidate cache after user registration
    await invalidateAdminUserList(); // Invalidate admin user list cache
    
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
// Log in with a phone number (or, for older accounts, an email) and password
export const loginUser = async (req, res) => {
  try {
    const { phone, email, password } = req.body || {};
    if ((!phone && !email) || !password) {
      return res.status(400).json({ message: 'Enter your phone number and password' });
    }

    let candidates = [];
    if (phone) {
      const filter = phoneFilter(phone);
      if (!filter) return res.status(400).json({ message: 'Enter a valid phone number, like 0912345678' });
      candidates = await User.find(filter).select('+password');
    } else {
      const loginDTO = new LoginDTO(email.trim(), password);
      candidates = await User.find({ email: loginDTO.email }).select('+password');
    }

    // Older data can have the same number on more than one account: use the one the password opens
    let user = null;
    for (const candidate of candidates) {
      if (await candidate.comparePassword(password)) {
        user = candidate;
        break;
      }
    }
    if (!user) {
      return res.status(400).json({ message: phone ? 'Wrong phone number or password' : 'Wrong email or password' });
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
