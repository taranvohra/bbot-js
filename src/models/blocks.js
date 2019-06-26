import mongoose from 'mongoose';

const schema = mongoose.Schema({
  server_id: String,
  blocked_users: [
    {
      id: String,
      username: String,
      blocked_on: Date,
      expires_at: Date,
      reason: String,
    },
  ],
});

export default mongoose.model('blocks', schema);
