import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign(
    { 
      id: user._id,
      name: user.username,
      isAdmin: user.isAdmin
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' }
  );

  res.json({ token });
});

router.post('/register', async (req, res) => {
  try {
    const { username, password, isAdmin } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    
    const user = new User({ 
      username, 
      password: hashed,
      isAdmin: isAdmin || false 
    });
    
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        name: user.username,
        isAdmin: user.isAdmin
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.status(201).json({ 
      message: 'User registered', 
      token,
      isAdmin: user.isAdmin 
    });

  } catch (err) {
    // Handle duplicate username or other errors
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// Guest login (always isAdmin: false)
router.post('/guest', async (req, res) => {
  const token = jwt.sign(
    { 
      id: 'guest', 
      name: 'Guest',
      isAdmin: false
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  res.json({ token });
});

export default router;