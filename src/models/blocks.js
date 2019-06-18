import mongoose from 'mongoose';

const schema = mongoose.Schema({
  server_id: String,
  blocked_users: [
    {
      id: String,
      name: String,
      blocked_on: Number,
      expires_at: Number,
    },
  ],
});

export default mongoose.model('blocks', schema);
