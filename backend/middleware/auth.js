import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Add middleware to check admin status
    req.isAdmin = () => decoded.isAdmin === true;
    
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Create a separate middleware for admin-only routes
export const adminMiddleware = (req, res, next) => {
  if (!req.isAdmin()) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export default authMiddleware;