import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Patient from '../model/Patient.js';
import User from '../model/UserModel.js';

const authMiddleware = async (req, res, next) => {
  try {
    console.log('Protect middleware: Entering middleware for route:', req.originalUrl);
    const authHeader = req.header('Authorization');
    console.log('Protect middleware: Headers:', req.headers);
    console.log('Protect middleware: Authorization:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Protect middleware: No token provided');
      return res.status(401).json({ success: false, error: 'Not authorized, no token' });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Protect middleware: Token:', token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Protect middleware: Decoded:', decoded);

    if (decoded.role !== 'patient') {
      console.log('Protect middleware: User role is not patient:', decoded.role);
      return res.status(403).json({ success: false, error: 'Access denied: Patient role required' });
    }

    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      console.log('Protect middleware: Invalid ObjectId:', decoded.id);
      return res.status(401).json({ success: false, error: 'Invalid user ID in token' });
    }

    console.log('Protect middleware: Database connection state:', mongoose.connection.readyState);
    console.log('Protect middleware: Database name:', mongoose.connection.db ? mongoose.connection.db.databaseName : 'No database connected');

    const user = await User.findById(decoded.id);
    console.log('Protect middleware: Query result for User ID:', decoded.id, user);
    if (!user) {
      console.log('Protect middleware: User not found for ID:', decoded.id);
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    const patient = await Patient.findOne({ user: decoded.id });
    console.log('Protect middleware: Associated Patient:', patient);

    req.user = user;
    req.patient = patient;
    console.log('Protect middleware: User set:', req.user);
    if (patient) {
      console.log('Protect middleware: Patient set:', req.patient);
    } else {
      console.log('Protect middleware: No associated patient found for user ID:', decoded.id);
    }

    next();
  } catch (error) {
    console.error('Protect middleware: Error:', error.message);
    return res.status(401).json({ success: false, error: 'Not authorized: ' + error.message });
  }
};

export default authMiddleware;