import asyncHandler from '../middlewares/asyncHandler.js';
import User from '../model/userModel.js';
import jwt from 'jsonwebtoken';





const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create new user
    const user = await User.create({ name, email, password, role });

    // Generate token with user details
    const token = generateToken(user._id, user.role, user.name, user.email);

    // Send success response
    res.status(201).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error('Register Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + err.message
    });
  }
});




const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (isMatch) {
      // Generate token with user details
      const token = generateToken(user._id, user.role, user.name, user.email);

      // Send success response
      return res.status(200).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error: ' + error.message
    });
  }
});




const logoutUser = asyncHandler(async (req, res) => {
  try {
    // Since JWT is stateless, logout is handled client-side by removing the token
    // We'll just send a success response
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// Generate JWT
const generateToken = (id, role, name = '', email = '') => {
  return jwt.sign({
    id,
    role,
    name,
    email
  }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

export { registerUser, loginUser, logoutUser };


