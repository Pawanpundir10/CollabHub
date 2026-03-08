import Message from '../models/Message.js';

export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected via Socket.io:', socket.id);

    // Join a specific group chat room
    socket.on('join-group', (groupId) => {
      socket.join(groupId);
      console.log(`Socket ${socket.id} joined group ${groupId}`);
    });

    // Handle sending message
    socket.on('send-message', async ({ groupId, text, senderId }) => {
      try {
        const msg = await Message.create({ group: groupId, sender: senderId, text });
        await msg.populate('sender', 'name avatarUrl');
        
        // Broadcast the populated message to everyone in the room (including sender)
        io.to(groupId).emit('new-message', msg);
      } catch (error) {
        console.error('Error saving/broadcasting message:', error);
      }
    });

    // Handle editing message
    socket.on('edit-message', async ({ messageId, groupId, newText, senderId }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg || msg.sender.toString() !== senderId) return;

        msg.text = newText;
        msg.isEdited = true;
        await msg.save();
        
        await msg.populate('sender', 'name avatarUrl');
        io.to(groupId).emit('message-edited', msg);
      } catch (error) {
        console.error('Error editing message:', error);
      }
    });

    // Handle deleting message
    socket.on('delete-message', async ({ messageId, groupId, senderId }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg || msg.sender.toString() !== senderId) return; // Only sender can delete

        await Message.findByIdAndDelete(messageId);
        
        // Broadcast deletion event with just the ID
        io.to(groupId).emit('message-deleted', messageId);
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
