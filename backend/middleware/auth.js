import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded; // Contains id and other payload data
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const isOwner = async (req, res, next) => {
  try {
    const module = await import('../models/Group.js');
    const Group = module.default;
    const group = await Group.findById(req.params.id || req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    
    if (group.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You are not the owner of this group' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Server Error verifying ownership' });
  }
};
