import express from 'express';
import JoinRequest from '../models/JoinRequest.js';
import Group from '../models/Group.js';
import { verifyToken, isOwner } from '../middleware/auth.js';

const router = express.Router();

// Get my pending requests
router.get('/me/requests', verifyToken, async (req, res) => {
  try {
    const requests = await JoinRequest.find({ user: req.user.id, status: 'pending' });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching user requests' });
  }
});

// Request to join a group
router.post('/:id/request', verifyToken, async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;

    // Check if group exists
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    // Check if already a member
    if (group.members.includes(userId)) {
      return res.status(400).json({ error: 'You are already a member of this group' });
    }

    // Check if user is already in any active group globally
    const existingGroup = await Group.findOne({ members: userId });
    if (existingGroup) {
      return res.status(400).json({ error: 'You are currently in a group. Leave that to join another one.' });
    }

    // Check for existing pending request
    const existingRequest = await JoinRequest.findOne({ group: groupId, user: userId, status: 'pending' });
    if (existingRequest) {
      return res.status(400).json({ error: 'Join request already pending' });
    }

    const newRequest = new JoinRequest({
      group: groupId,
      user: userId,
      status: 'pending'
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating join request' });
  }
});

// Get pending requests for a group (Owner only)
router.get('/:id/requests', verifyToken, isOwner, async (req, res) => {
  try {
    const requests = await JoinRequest.find({ group: req.params.id, status: 'pending' })
      .populate('user', 'name avatarUrl email');
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching join requests' });
  }
});

// Accept/Reject a request (Owner only)
router.patch('/:id/requests/:reqId', verifyToken, isOwner, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const request = await JoinRequest.findById(req.params.reqId);
    if (!request || request.group.toString() !== req.params.id) {
      return res.status(404).json({ error: 'Join request not found' });
    }

    request.status = status;
    await request.save();

    if (status === 'accepted') {
      const group = await Group.findById(req.params.id);
      if (!group.members.includes(request.user)) {
        group.members.push(request.user);
        await group.save();
      }
    }

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error updating join request' });
  }
});

export default router;
