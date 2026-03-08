import express from 'express';
import Group from '../models/Group.js';
import { verifyToken, isOwner } from '../middleware/auth.js';

const router = express.Router();

// Get all groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('owner', 'name avatarUrl')
      .sort({ createdAt: -1 });
    res.json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching groups' });
  }
});

// Get single group
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('owner', 'name avatarUrl')
      .populate('members', 'name avatarUrl email');
    
    if (!group) return res.status(404).json({ error: 'Group not found' });
    res.json(group);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching group details' });
  }
});

// Create group
router.post('/', verifyToken, async (req, res) => {
  try {
    // Check if user is already in any group
    const existingGroup = await Group.findOne({ members: req.user.id });
    if (existingGroup) {
      return res.status(400).json({ error: 'You are currently in a group. Leave that to create a new one.' });
    }

    const newGroup = new Group({
      ...req.body,
      owner: req.user.id,
      members: [req.user.id] // Owner is automatically a member
    });
    
    const savedGroup = await newGroup.save();
    res.status(201).json(savedGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating group' });
  }
});

// Delete group (Owner only)
router.delete('/:id', verifyToken, isOwner, async (req, res) => {
  try {
    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error deleting group' });
  }
});

// Remove member (Owner only)
router.delete('/:id/members/:memberId', verifyToken, isOwner, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    
    group.members = group.members.filter(m => m.toString() !== req.params.memberId);
    await group.save();
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error removing member' });
  }
});

// Leave group (Member only)
router.post('/:id/leave', verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    // Validate if the user is a member
    if (!group.members.includes(req.user.id)) {
      return res.status(400).json({ error: 'You are not a member of this group' });
    }

    // Owner cannot leave the group normally
    if (group.owner.toString() === req.user.id) {
      return res.status(400).json({ error: 'The group owner cannot leave. You must delete the group instead.' });
    }

    // Remove user
    group.members = group.members.filter(m => m.toString() !== req.user.id);
    await group.save();
    
    res.json({ message: 'Successfully left the group' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error leaving group' });
  }
});

export default router;
