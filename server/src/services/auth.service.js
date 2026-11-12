// ============================================
// auth.service.js - Authentication Service
// ============================================
// Contains the business logic for:
//   - Email/password registration and login
//   - Getting user profile
// Reference: bcrypt.hash(), bcrypt.compare() - reference-backend.md
// ============================================

import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';
import { generateToken } from '../utils/jwt.utils.js';

/**
 * Register a new user with email and password.
 */
export const register = async (name, email, password) => {
  // Check if email already exists
  if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email.trim())) {
  const error = new Error('Please use a valid Gmail address.');
  error.statusCode = 400;
  throw error;
}
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('Email already registered.');
    error.statusCode = 409;
    throw error;
  }

  // Hash the password with bcrypt (10 salt rounds)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user in the database
  const user = await User.create({ name, email, password: hashedPassword });

  // Generate a JWT token
  const token = generateToken(user);

  return {
    token,
    user: { id: user._id, email: user.email, name: user.name, role: user.role || 'user' },
  };
};

/**
 * Login a user with email and password.
 */
export const emailLogin = async (email, password) => {
  // Find user by email
  if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email.trim())) {
  const error = new Error('Please use a valid Gmail address.');
  error.statusCode = 400;
  throw error;
}
  const user = await User.findOne({ email });
  if (!user || !user.password) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  // Compare the provided password with the stored hash
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  // Update last login time
  user.lastLogin = new Date();
  await user.save();

  // Generate a JWT token
  const token = generateToken(user);

  return {
    token,
    user: { id: user._id, email: user.email, name: user.name, role: user.role || 'user' },
  };
};

/**
 * Get a user's profile by their ID.
 */
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-__v -password');

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role || 'user',
    picture: user.picture,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  };
};
